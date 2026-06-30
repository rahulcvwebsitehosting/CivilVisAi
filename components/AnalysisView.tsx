
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, UserRole, StructuralAnalysis, Defect } from '../types.ts';
import EngineeringChatbot from './EngineeringChatbot.tsx';
import { analyzeImage, refineExpertAdvice, saveCorrection, expandAnalysisSection, generateStructuralXRay } from '../services/gemini.ts';
import { CONCRETE_STANDARDS, EQUIPMENT_TEMPLATES } from '../constants.ts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { marked } from 'marked';

interface AnalysisResultExtended extends AnalysisResult {
  isFromMemory?: boolean;
}

interface AnalysisViewProps {
  analysis: AnalysisResultExtended;
  onBack: () => void;
  role: UserRole;
}

const TABS = ['summary', 'technical', 'inspection', 'consult', 'chat'] as const;

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis: initialAnalysis, onBack }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult>(initialAnalysis);
  const [isVerified, setIsVerified] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [refinementContext, setRefinementContext] = useState('');
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);
  const [reAnalyzeStatus, setReAnalyzeStatus] = useState("Processing Manual Correction...");
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('summary');
  const [isLoadingDeepData, setIsLoadingDeepData] = useState(true);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  
  // Content Rectification States
  const [rectificationText, setRectificationText] = useState('');
  const [isSavingRectification, setIsSavingRectification] = useState(false);
  
  // Expansion States
  const [expandedContent, setExpandedContent] = useState<Record<string, string>>({});
  const [isExpanding, setIsExpanding] = useState<Record<string, boolean>>({});
  
  // Content Override States for inline editing
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [tempOverrides, setTempOverrides] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const engineeringData = currentAnalysis.data || {} as StructuralAnalysis;
  const isMachinery = engineeringData.elementCategory === 'MACHINERY';
  const canGenerateXRay = engineeringData.elementCategory === 'STRUCTURE' || engineeringData.elementCategory === 'PAVEMENT';
  const isXRayBlocked = engineeringData.elementCategory === 'EXPERIMENT' || engineeringData.elementCategory === 'UNDEFINED' || engineeringData.elementCategory === 'UNKNOWN';

  // X-Ray State
  const [xRayGenerated, setXRayGenerated] = useState<Record<string, boolean>>({});
  const [xRayImages, setXRayImages] = useState<Record<string, string>>({});
  const [isGeneratingXRay, setIsGeneratingXRay] = useState(false);
  const [isFullScreenXRay, setIsFullScreenXRay] = useState(false);
  
  const isXRayGenerated = xRayGenerated[currentAnalysis.id] || !!engineeringData.xRayImageUrl;
  const xRayImageUrl = xRayImages[currentAnalysis.id] || engineeringData.xRayImageUrl;

  const lastRequestTimeRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab('summary');
    setIsVerified(false);
    setIsWrong(false);
    setIsLoadingDeepData(true);
    setIsEditingContent(false);
    setTempOverrides({});
    setHasUnsavedChanges(false);
    setQuotaExceeded(false);
    setExpandedContent({});
    setIsExpanding({});
    
    // Initialize rectification text if empty
    if (!rectificationText) {
      const defectSummary = (engineeringData.defects || [])
        .map(d => `${d.type} (${d.severity}): ${d.cause}`)
        .join('\n');
      
      const initialText = `SUMMARY:\n${engineeringData.executiveSummary?.brief || ""}\n\nINSPECTION FINDINGS:\n${defectSummary}`;
      setRectificationText(initialText);
    }
    
    const timer = setTimeout(() => setIsLoadingDeepData(false), 800);
    return () => clearTimeout(timer);
  }, [initialAnalysis.id]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleExpand = async (section: 'summary' | 'technical' | 'inspection' | 'consult') => {
    if (expandedContent[section] || isExpanding[section]) return;

    setIsExpanding(prev => ({ ...prev, [section]: true }));
    try {
      const markdown = await expandAnalysisSection(engineeringData, section);
      setExpandedContent(prev => ({ ...prev, [section]: markdown }));
    } catch (e) {
      console.error("Expansion failed", e);
    } finally {
      setIsExpanding(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleGenerateXRay = async () => {
    if (!canGenerateXRay || isXRayGenerated || isGeneratingXRay) return;
    
    setIsGeneratingXRay(true);
    try {
      const { imageUrl, typology } = await generateStructuralXRay(engineeringData);
      setXRayImages(prev => ({ ...prev, [currentAnalysis.id]: imageUrl }));
      setXRayGenerated(prev => ({ ...prev, [currentAnalysis.id]: true }));
      
      // Cache to local report state
      const updatedData = { ...engineeringData, xRayImageUrl: imageUrl, xRayTypology: typology };
      setCurrentAnalysis(prev => ({ ...prev, data: updatedData }));
      saveCorrection(currentAnalysis.imageHash, updatedData);
    } catch (e) {
      console.error("X-Ray generation failed", e);
      alert("Failed to generate Structural X-Ray. Please try again.");
    } finally {
      setIsGeneratingXRay(false);
    }
  };

  const downloadXRay = () => {
    if (!xRayImageUrl) return;
    const link = document.createElement('a');
    link.href = xRayImageUrl;
    link.download = `Structural_XRay_${currentAnalysis.id.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      return { __html: text };
    }
  };

  const applyLocalGradeOverride = (grade: string) => {
    const std = CONCRETE_STANDARDS[grade];
    if (!std) return;

    const updatedData: StructuralAnalysis = {
      ...engineeringData,
      elementCategory: 'STRUCTURE',
      isCorrection: true,
      constructionMethodology: {
        ...engineeringData.constructionMethodology,
        methodSummary: `Manual structural verification for ${grade} grade concrete.`,
        concreteSpecs: {
          grade: grade,
          mixDesign: [
            { material: 'Cement', quantity: std.cement, proportion: std.ratio.split(':')[0] || '1' },
            { material: 'Water/Cement', quantity: std.wc, proportion: 'Ratio' },
            { material: 'Aggregates', quantity: 'Calculated', proportion: std.ratio.split(':').slice(1).join(':') }
          ]
        }
      }
    };

    setCurrentAnalysis(prev => ({ ...prev, data: updatedData }));
    saveCorrection(currentAnalysis.imageHash, updatedData);
    setIsVerified(true);
    setIsWrong(false);
    setRefinementContext('');
  };

  const applyMachineryTemplate = (type: string) => {
    const template = EQUIPMENT_TEMPLATES[type];
    if (!template) return;

    const updatedData: StructuralAnalysis = {
      ...engineeringData,
      elementName: template.name,
      elementCategory: 'MACHINERY',
      isCorrection: true,
      constructionMethodology: {
        methodSummary: `Mechanical inspection report for ${template.name}.`,
        machinerySpecs: {
          liftingCapacity: template.capacity,
          boomLength: template.boom,
          counterweight: 'As per manual',
          safetyFactor: '1.25 (Standard)'
        }
      },
      defects: (template.checklist || []).map((item: string) => ({
        type: item,
        severity: 'Medium',
        cause: 'Inspection Required',
        remedy: 'Verify as per safety checklist'
      })),
      recommendations: [template.swl_advice, 'Perform daily operator check before slewing.']
    };

    setCurrentAnalysis(prev => ({ ...prev, data: updatedData }));
    saveCorrection(currentAnalysis.imageHash, updatedData);
    setIsVerified(true);
    setIsWrong(false);
  };

  const handleReAnalyze = async () => {
    const now = Date.now();
    if (now - lastRequestTimeRef.current < 2000) return; // Faster debounce for Fast Path
    lastRequestTimeRef.current = now;

    const capturedContext = refinementContext.trim();
    if (!capturedContext || isReAnalyzing) return;
    
    setIsReAnalyzing(true);
    setReAnalyzeStatus(`Applying Manual Override: "${capturedContext}"...`);
    setQuotaExceeded(false);

    const lowerContext = capturedContext.toLowerCase();

    // FAST PATH 1: Concrete Grade Pattern Matching
    const gradeMatch = capturedContext.match(/M[0-9]{2}/i);
    if (gradeMatch) {
      applyLocalGradeOverride(gradeMatch[0].toUpperCase());
      setIsReAnalyzing(false);
      return;
    }

    // FAST PATH 2: Machinery Template Matching (Koden, Crane, etc.)
    if (lowerContext.includes('koden')) {
      applyMachineryTemplate('KODEN');
      setIsReAnalyzing(false);
      return;
    }
    if (lowerContext.includes('crane')) {
      applyMachineryTemplate('TOWER_CRANE');
      setIsReAnalyzing(false);
      return;
    }
    if (lowerContext.includes('excavator') || lowerContext.includes('jcb')) {
      applyMachineryTemplate('EXCAVATOR');
      setIsReAnalyzing(false);
      return;
    }
    if (lowerContext.includes('piling') || lowerContext.includes('pile')) {
      applyMachineryTemplate('PILING_RIG');
      setIsReAnalyzing(false);
      return;
    }

    // FAST PATH 3: Metadata-Only Gemini Refinement (No Image)
    try {
      setReAnalyzeStatus("Synchronizing Technical Methodology...");
      const refinedUpdate = await refineExpertAdvice(engineeringData, capturedContext);
      
      const updatedData = { 
        ...engineeringData, 
        ...refinedUpdate, 
        isCorrection: true, 
        originalData: engineeringData 
      };

      saveCorrection(currentAnalysis.imageHash, updatedData);
      setCurrentAnalysis(prev => ({ ...prev, data: updatedData }));
      setIsVerified(true);
      setIsWrong(false);
    } catch (err: any) {
      console.error("Fast Path Refinement Failed:", err);
      if (err?.status === 429 || err?.message === 'QUOTA_EXCEEDED') {
        setQuotaExceeded(true);
        setIsEditingContent(true);
      }
    } finally {
      setIsReAnalyzing(false);
    }
  };

  const handleSaveRectification = () => {
    setIsSavingRectification(true);
    const updatedData: StructuralAnalysis = {
      ...engineeringData,
      isCorrection: true,
      executiveSummary: {
        ...engineeringData.executiveSummary,
        brief: rectificationText
      }
    };
    
    setTimeout(() => {
      setCurrentAnalysis(prev => ({ ...prev, data: updatedData }));
      saveCorrection(currentAnalysis.imageHash, updatedData);
      setIsSavingRectification(false);
      setActiveTab('summary');
    }, 600);
  };

  // --- PROFESSIONAL PDF ENGINE ---
  const generatePDFReport = async () => {
    const doc = new jsPDF();
    const data = currentAnalysis.data;
    
    // Constants
    const PAGE_MARGIN = 10; // 10mm margin
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
    const PRIMARY_COLOR: [number, number, number] = [37, 99, 235]; // Royal Blue
    
    let cursorY = 20;

    // Helper: Safe Text (Handles undefined/null/objects)
    const safeText = (txt: any): string => {
      if (txt === null || txt === undefined) return "N/A";
      if (typeof txt === 'object') return ""; // Skip objects that aren't strings
      return String(txt)
        .replace(/[^\x20-\x7E\n\r]/g, '') // Basic sanitization
        .replace(/"/g, '') // Remove quotes
        .replace(/\*\*/g, ''); // Remove bold markers
    };

    // Helper: Draw Borders & Page Numbers
    const applyPageTemplate = () => {
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            // 1mm Frame Border
            doc.setLineWidth(1);
            doc.setDrawColor(0, 0, 0); // Black frame
            doc.rect(PAGE_MARGIN, PAGE_MARGIN, PAGE_WIDTH - (PAGE_MARGIN * 2), PAGE_HEIGHT - (PAGE_MARGIN * 2));
            
            // Header
            doc.setFillColor(...PRIMARY_COLOR);
            doc.rect(PAGE_MARGIN, PAGE_MARGIN, PAGE_WIDTH - (PAGE_MARGIN * 2), 15, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text("CIVILVISION ENGINEERING REPORT", PAGE_MARGIN + 5, PAGE_MARGIN + 10);
            
            // Sub-header Info (Right aligned)
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            const dateStr = `DATE: ${new Date().toLocaleDateString()}`;
            const idStr = `ID: ${currentAnalysis.id.substring(0,8).toUpperCase()}`;
            doc.text(`${dateStr}  |  ${idStr}`, PAGE_WIDTH - PAGE_MARGIN - 5, PAGE_MARGIN + 10, { align: 'right' });

            // Footer
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${totalPages} | Generated via CivilVision AI | Digital Record`, PAGE_WIDTH / 2, PAGE_HEIGHT - PAGE_MARGIN - 2, { align: 'center' });
        }
    };

    // Helper: Check for Page Break
    const checkBreak = (heightNeeded: number) => {
        if (cursorY + heightNeeded > PAGE_HEIGHT - (PAGE_MARGIN + 15)) {
            doc.addPage();
            cursorY = 40; // Reset below header
            return true;
        }
        return false;
    };

    // 1. Initial Setup
    cursorY = 40; // Start below header

    // 2. Main Image Integration
    try {
        const img = new Image();
        img.src = currentAnalysis.image;
        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; 
        });
        
        // Center Image
        const maxImgHeight = 80;
        const imgRatio = img.height / img.width;
        let imgW = 120;
        let imgH = imgW * imgRatio;
        
        if (imgH > maxImgHeight) {
            imgH = maxImgHeight;
            imgW = imgH / imgRatio;
        }
        
        const xPos = (PAGE_WIDTH - imgW) / 2;
        doc.addImage(currentAnalysis.image, 'JPEG', xPos, cursorY, imgW, imgH);
        
        // Image Border
        doc.setLineWidth(0.2);
        doc.setDrawColor(0, 0, 0);
        doc.rect(xPos, cursorY, imgW, imgH);
        
        cursorY += imgH + 10;
    } catch (e) {
        console.warn("Image processing error", e);
    }

    // 3. Project Details Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`PROJECT: ${safeText(data.elementName).toUpperCase()}`, PAGE_MARGIN + 5, cursorY);
    cursorY += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`CATEGORY: ${safeText(data.elementCategory)}`, PAGE_MARGIN + 5, cursorY);
    cursorY += 12;

    // 4. Content Renderer (Handles Text & AutoTables)
    const renderSmartContent = (title: string, contentKey: string, fallbackText: string, fallbackRender?: () => void) => {
        checkBreak(30);
        
        // Section Header
        doc.setFillColor(240, 240, 240);
        doc.rect(PAGE_MARGIN, cursorY, CONTENT_WIDTH, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(title.toUpperCase(), PAGE_MARGIN + 2, cursorY + 5.5);
        cursorY += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);

        const cleanValue = (v: string) => v.replace(/"/g, '').replace(/\*\*/g, '').trim();

        // Determine Source Data (Prioritize Expanded State)
        let rawContent = expandedContent[contentKey] || fallbackText;

        if (rawContent && rawContent.length > 5) {
            const lines = rawContent.split('\n');
            let tableBuffer: string[][] = [];
            let inTable = false;

            const flushTable = () => {
                if (tableBuffer.length > 0) {
                    checkBreak(30);
                    autoTable(doc, {
                        startY: cursorY,
                        head: [tableBuffer[0]],
                        body: tableBuffer.slice(1),
                        theme: 'striped',
                        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                        styles: { fontSize: 9, cellPadding: 2 },
                        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
                        tableWidth: CONTENT_WIDTH
                    });
                    cursorY = (doc as any).lastAutoTable.finalY + 8;
                }
                inTable = false;
                tableBuffer = [];
            };

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Addendum Cleanup
                if (line.toUpperCase().includes("SENIOR ENGINEER'S CLOSING STATEMENT")) {
                    if (inTable) flushTable();
                    cursorY += 10; // 10mm top margin
                }

                // Markdown Table Detection
                if (line.startsWith('|')) {
                    if (!inTable) {
                        inTable = true;
                        if (line.includes('---')) continue;
                    }
                    if (line.includes('---')) continue;
                    const cells = line.split('|').map(cleanValue).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
                    if (cells.length > 0) tableBuffer.push(cells);
                } 
                // CSV Table Detection
                else if (line.includes(',') && line.split(',').length > 2) {
                    if (!inTable) inTable = true;
                    const cells = line.split(',').map(cleanValue);
                    tableBuffer.push(cells);
                }
                else {
                    if (inTable) flushTable();

                    if (line.length === 0) continue;

                    // Standard Text Rendering
                    if (line.startsWith('#') || (line.startsWith('**') && !line.includes(' '))) {
                         checkBreak(10);
                         doc.setFont("helvetica", "bold");
                         const cleanHeader = line.replace(/#/g, '').replace(/\*\*/g, '').trim();
                         doc.text(cleanHeader, PAGE_MARGIN, cursorY);
                         cursorY += 6;
                         doc.setFont("helvetica", "normal");
                    } 
                    else if (line.startsWith('- ') || line.startsWith('* ')) {
                         checkBreak(6);
                         const cleanBullet = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').replace(/"/g, '');
                         const splitBullet = doc.splitTextToSize(`• ${cleanBullet}`, CONTENT_WIDTH - 5);
                         doc.text(splitBullet, PAGE_MARGIN + 5, cursorY);
                         cursorY += (splitBullet.length * 5) + 2;
                    }
                    else {
                         checkBreak(6);
                         const cleanP = line.replace(/\*\*/g, '').replace(/"/g, '');
                         const splitP = doc.splitTextToSize(cleanP, CONTENT_WIDTH);
                         doc.text(splitP, PAGE_MARGIN, cursorY);
                         cursorY += (splitP.length * 5) + 2;
                    }
                }
            }
            if (inTable) flushTable();
        } else {
            if (fallbackRender) fallbackRender();
        }
        
        cursorY += 5;
    };

    // --- EXECUTE SECTIONS ---

    // 1. Executive
    renderSmartContent("1. EXECUTIVE ANALYSIS", 'summary', safeText(data.executiveSummary?.brief));

    // 2. Technical
    renderSmartContent("2. TECHNICAL SPECIFICATIONS", 'technical', safeText(data.constructionMethodology?.methodSummary), () => {
         // Fallback specific tables if no expanded text
         if (data.constructionMethodology?.concreteSpecs?.mixDesign) {
             autoTable(doc, {
                 startY: cursorY,
                 head: [['Material', 'Quantity', 'Ratio']],
                 body: (data.constructionMethodology?.concreteSpecs?.mixDesign || []).map(m => [safeText(m.material), safeText(m.quantity), safeText(m.proportion)]),
                 theme: 'striped',
                 headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                 margin: { left: PAGE_MARGIN, right: PAGE_MARGIN }
             });
             cursorY = (doc as any).lastAutoTable.finalY + 10;
         }
    });

    // 3. Inspection
    renderSmartContent("3. INSPECTION FINDINGS", 'inspection', "", () => {
         if (data.defects && data.defects.length > 0) {
            autoTable(doc, {
                startY: cursorY,
                head: [['Defect Type', 'Severity', 'Cause', 'Remedy']],
                body: data.defects.map(d => [safeText(d.type), safeText(d.severity), safeText(d.cause), safeText(d.remedy)]),
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 8 },
                margin: { left: PAGE_MARGIN, right: PAGE_MARGIN }
            });
            cursorY = (doc as any).lastAutoTable.finalY + 10;
         } else {
             doc.text("No significant defects recorded.", PAGE_MARGIN, cursorY);
             cursorY += 10;
         }
    });

    // 4. Addendum (Using safe text to prevent garbage chars)
    // Note: 'consult' might be expanded or come from rectificationText
    const consultText = expandedContent['consult'] || rectificationText || "No additional notes.";
    renderSmartContent("4. ENGINEER'S ADDENDUM", 'consult', safeText(consultText));

    // 5. Signature Block
    checkBreak(40);
    cursorY += 10;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0,0,0);
    doc.line(PAGE_WIDTH - PAGE_MARGIN - 60, cursorY, PAGE_WIDTH - PAGE_MARGIN, cursorY);
    cursorY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AUTHORIZED SIGNATORY", PAGE_WIDTH - PAGE_MARGIN - 60, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("CivilVision Digital Verification", PAGE_WIDTH - PAGE_MARGIN - 60, cursorY + 4);

    // Apply Global Template (Header/Footer/Border) to ALL pages
    applyPageTemplate();

    doc.save(`CivilVision_Report_${safeText(data.elementName).replace(/\s/g,'_')}.pdf`);
  };

  const toggleEditMode = () => {
    if (isEditingContent && hasUnsavedChanges) {
      const newAnalysisData: StructuralAnalysis = { ...engineeringData };
      
      if (tempOverrides['summary_brief'] !== undefined) {
        newAnalysisData.executiveSummary = {
          ...newAnalysisData.executiveSummary,
          brief: tempOverrides['summary_brief']
        };
      }
      
      if (tempOverrides['tech_method'] !== undefined) {
        newAnalysisData.constructionMethodology = {
          ...newAnalysisData.constructionMethodology,
          methodSummary: tempOverrides['tech_method']
        };
      }

      setCurrentAnalysis(prev => ({ ...prev, data: newAnalysisData }));
      saveCorrection(currentAnalysis.imageHash, newAnalysisData);
      setHasUnsavedChanges(false);
    }
    setIsEditingContent(!isEditingContent);
  };

  const renderEditableText = (key: string, value: string) => {
    const currentVal = tempOverrides[key] ?? value;
    if (isEditingContent) {
      return (
        <textarea
          value={currentVal}
          onChange={(e) => {
            setTempOverrides(prev => ({ ...prev, [key]: e.target.value }));
            setHasUnsavedChanges(true);
          }}
          className="w-full bg-slate-900 border border-blue-500/50 rounded-xl p-3 text-xs text-white min-h-[100px] resize-none"
        />
      );
    }
    return <p className="text-xs font-medium text-theme-muted leading-relaxed whitespace-pre-wrap">{value}</p>;
  };

  const renderExpandButton = (section: string, label: string) => (
    <div className="mt-4">
      {isExpanding[section] ? (
        <div className="flex items-center justify-center space-x-2 py-4 bg-slate-900 rounded-xl border border-blue-500/20">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest ml-2">Deep Diving into Technical Standards...</span>
        </div>
      ) : (
        <button 
          onClick={() => handleExpand(section as any)}
          className="w-full py-3 bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          ✨ {label}
        </button>
      )}
    </div>
  );

  const renderExpandedContent = (section: string) => {
    if (!expandedContent[section]) return null;
    return (
      <div className="mt-6 p-4 bg-slate-900 border border-theme rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div 
          className="chat-markdown text-xs text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={renderMarkdown(expandedContent[section])}
        />
      </div>
    );
  };

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      <div className="bg-theme-card p-6 rounded-3xl border border-theme">
        <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4">
          {isMachinery ? "⚙️ Machinery Specifications" : "🏗️ Structural Methodology"}
        </h4>
        
        {isMachinery ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[8px] text-blue-500 font-black uppercase block mb-1">Max Capacity</span>
                <span className="text-[10px] font-black text-white">{engineeringData.constructionMethodology?.machinerySpecs?.liftingCapacity || "N/A"}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[8px] text-blue-500 font-black uppercase block mb-1">Boom / Reach</span>
                <span className="text-[10px] font-black text-white">{engineeringData.constructionMethodology?.machinerySpecs?.boomLength || "N/A"}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[8px] text-blue-500 font-black uppercase block mb-1">Safety Factor</span>
                <span className="text-[10px] font-black text-white">{engineeringData.constructionMethodology?.machinerySpecs?.safetyFactor || "1.25"}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic mt-4">Verification as per IS 13367 / Site Safety Standards.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderEditableText('tech_method', engineeringData.constructionMethodology?.methodSummary || "")}
            {engineeringData.constructionMethodology?.concreteSpecs && (
               <div className="bg-slate-900 border border-theme rounded-2xl p-4">
                 <h5 className="text-[8px] font-black text-blue-500 uppercase mb-3">Concrete Mix ({engineeringData.constructionMethodology?.concreteSpecs?.grade || 'N/A'})</h5>
                 <div className="space-y-2">
                   {(engineeringData.constructionMethodology?.concreteSpecs?.mixDesign || []).map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                        <span className="text-slate-500 font-bold uppercase">{item.material}</span>
                        <span className="text-white font-black">{item.quantity}</span>
                     </div>
                   ))}
                 </div>
               </div>
            )}
          </div>
        )}
        {!expandedContent['technical'] && renderExpandButton('technical', 'Expand Technical Data')}
      </div>
      {renderExpandedContent('technical')}
    </div>
  );

  const renderInspectionTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black uppercase text-theme-muted tracking-widest italic">
          {isMachinery ? "🛡️ Mechanical Integrity Checklist" : "⚠️ Structural Defects & Anomalies"}
        </h4>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[8px] text-slate-500 font-black uppercase">Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[8px] text-slate-500 font-black uppercase">Medium</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {engineeringData.defects?.map((defect, idx) => (
          <div key={idx} className={`bg-slate-900 border rounded-3xl p-6 space-y-4 transition-all hover:border-blue-500/50 ${
            defect.severity === 'Critical' ? 'border-red-500/30' : 'border-theme'
          }`}>
             <div className="flex justify-between items-start">
               <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                    defect.severity === 'Critical' ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'
                  }`}>
                    {defect.type.toLowerCase().includes('crack') ? '📉' : 
                     defect.type.toLowerCase().includes('corrosion') ? '☢️' : 
                     defect.type.toLowerCase().includes('spall') ? '🧱' : '⚠️'}
                  </div>
                  <div>
                    <h5 className="text-[9px] font-black uppercase text-slate-500 mb-0.5">Defect ID: #D-{String(idx+1).padStart(3, '0')}</h5>
                    <div className="text-sm font-black text-white uppercase italic tracking-tight">{defect.type}</div>
                  </div>
               </div>
               <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg ${
                 defect.severity === 'Critical' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-blue-600 text-white shadow-blue-600/20'
               }`}>
                 {defect.severity}
               </span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <span className="text-[8px] font-black text-slate-600 uppercase">Probable Cause</span>
                 <p className="text-[10px] text-slate-400 font-medium leading-tight">{defect.cause}</p>
               </div>
               <div className="space-y-1">
                 <span className="text-[8px] font-black text-green-600 uppercase">Remedial Action</span>
                 <p className="text-[10px] text-slate-300 font-bold italic leading-tight">{defect.remedy}</p>
               </div>
             </div>

             <div className="h-[1px] bg-white/5 w-full"></div>
             
             <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[8px]">👤</div>
                  ))}
                </div>
                <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline">Log Inspection Details</button>
             </div>
          </div>
        ))}
      </div>
      
      {!expandedContent['inspection'] && renderExpandButton('inspection', 'Generate Detailed Inspection Report')}
      {renderExpandedContent('inspection')}
    </div>
  );

  if (!isVerified) {
    return (
      <div className="flex flex-col h-full bg-theme-main font-mono overflow-hidden relative">
        {/* Full Screen Loading Overlay for Re-Analysis */}
        {isReAnalyzing && (
          <div className="absolute inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-sm font-black text-white uppercase italic tracking-tighter mb-2">{reAnalyzeStatus}</h2>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Applying Engineering Logic...</p>
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between border-b border-theme bg-theme-card/50">
          <button onClick={onBack} disabled={isReAnalyzing} className="p-2 text-theme-muted disabled:opacity-30"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Verification Mode</span>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative flex flex-col items-center">
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-theme shadow-xl relative bg-slate-900">
            <img src={currentAnalysis.image} className="w-full h-full object-contain" />
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 text-[9px] text-white font-black uppercase">
               Detected: {engineeringData.elementCategory}
            </div>
          </div>

          {quotaExceeded ? (
            <div className="w-full space-y-6 animate-in fade-in duration-300">
               <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-2xl text-center">
                  <p className="text-[10px] text-red-200 font-black uppercase tracking-widest mb-1">⚠️ AI Quota Peak Capacity</p>
                  <p className="text-[9px] text-slate-400 uppercase">Use <b>Manual Fallback</b> to continue documentation.</p>
               </div>
               
               <div className="space-y-4">
                  <div className="bg-slate-900 border border-theme rounded-2xl p-4">
                     <label className="text-[8px] font-black uppercase text-blue-500 mb-2 block">Quick Search Templates</label>
                     <input 
                        type="text"
                        placeholder="Type 'Crane', 'Excavator', 'M20'..."
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        className="w-full bg-black border border-slate-800 rounded-xl p-3 text-[10px] font-bold text-white outline-none focus:border-blue-500"
                     />
                     
                     <div className="mt-4 flex flex-wrap gap-2">
                        {Object.keys(EQUIPMENT_TEMPLATES).map(k => (
                          <button key={k} onClick={() => applyMachineryTemplate(k)} className="px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 rounded text-[8px] font-black text-blue-400 uppercase">{k.replace('_', ' ')}</button>
                        ))}
                        {Object.keys(CONCRETE_STANDARDS).slice(2, 6).map(g => (
                          <button key={g} onClick={() => applyLocalGradeOverride(g)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-[8px] font-black text-slate-400 uppercase">{g} Mix</button>
                        ))}
                     </div>
                  </div>
                  
                  <button onClick={() => setIsVerified(true)} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Manual Data Entry</button>
               </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="bg-theme-card/80 border border-theme rounded-3xl p-6 text-center">
                <div className="text-xl font-black uppercase italic text-white mb-2">{engineeringData.elementName}</div>
                <p className="text-[11px] text-theme-muted font-medium">{engineeringData.executiveSummary?.brief}</p>
              </div>
              
              {!isWrong ? (
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => setIsVerified(true)} disabled={isReAnalyzing} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase disabled:opacity-50">Confirm</button>
                   <button 
                    onClick={() => setIsWrong(true)} 
                    disabled={isReAnalyzing}
                    title="Click to manually set technical parameters (Grade, Ratio, etc.) if AI detection is inaccurate."
                    className="bg-theme-card border border-theme text-theme-muted py-4 rounded-2xl font-black text-xs uppercase hover:bg-theme-muted/10 transition-colors disabled:opacity-50"
                   >
                     MANUAL OVERRIDE
                   </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                   <textarea 
                     value={refinementContext}
                     onChange={(e) => setRefinementContext(e.target.value)}
                     disabled={isReAnalyzing}
                     placeholder="Enter details (e.g. 'This is a Tower Crane')..."
                     className="w-full bg-slate-900 border border-theme rounded-2xl p-4 text-[11px] text-white h-24 outline-none focus:border-blue-500 disabled:opacity-50"
                   />
                   <div className="flex gap-4">
                      <button onClick={() => setIsWrong(false)} disabled={isReAnalyzing} className="flex-1 bg-slate-800 py-4 rounded-2xl font-black text-xs text-slate-400 disabled:opacity-50">Cancel</button>
                      <button onClick={handleReAnalyze} disabled={isReAnalyzing} className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-xs text-white disabled:opacity-50">Apply</button>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-theme-main overflow-hidden font-sans">
      <div className="px-6 py-4 flex items-center justify-between bg-theme-card/90 border-b border-theme sticky top-0 z-30 backdrop-blur-xl">
        <button onClick={onBack} className="p-2 -ml-2 text-theme-muted"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
        <div className="text-center">
          <div className="text-[8px] text-blue-500 font-black uppercase mb-1 italic">{engineeringData.elementCategory}</div>
          <div className="text-xs font-black uppercase truncate max-w-[180px]">{engineeringData.elementName}</div>
        </div>
        <button onClick={toggleEditMode} className={`p-2.5 rounded-xl border transition-all ${isEditingContent ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="relative w-full h-56 bg-slate-950">
          <img src={currentAnalysis.image} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-t from-theme-main"></div>
        </div>

        <div className="sticky top-0 z-20 px-4 py-3 bg-theme-main/95 backdrop-blur-xl border-b border-theme overflow-x-auto scrollbar-hide">
          <div className="flex p-1 bg-theme-card/50 rounded-2xl border border-theme relative min-w-max">
            {TABS.map((id) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${activeTab === id ? 'bg-blue-600 text-white' : 'text-theme-muted'}`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 pb-32">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Health Score Gauge */}
              {engineeringData.healthScore !== undefined && (
                <div className="bg-slate-900 border border-theme rounded-3xl p-6 flex items-center space-x-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-800"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={2 * Math.PI * 36 * (1 - engineeringData.healthScore / 100)}
                        className={`${
                          engineeringData.healthScore > 80 ? 'text-green-500' : 
                          engineeringData.healthScore > 50 ? 'text-yellow-500' : 'text-red-500'
                        } transition-all duration-1000 ease-out`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white">{engineeringData.healthScore}</span>
                      <span className="text-[8px] text-slate-500 font-black uppercase">Health</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 mb-1">Structural Integrity</h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {engineeringData.healthScore > 80 ? 'Structure appears stable with minimal distress.' : 
                       engineeringData.healthScore > 50 ? 'Moderate distress detected. Monitoring recommended.' : 
                       'Critical defects identified. Immediate inspection required.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20">
                <h4 className="text-[10px] font-black uppercase text-blue-500 mb-4">Executive Brief</h4>
                {renderEditableText('summary_brief', engineeringData.executiveSummary?.brief || "")}
                {!expandedContent['summary'] && renderExpandButton('summary', 'Expand Analysis')}
              </div>
              {renderExpandedContent('summary')}
              
              {xRayImageUrl && (
                <div className={`bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 ${isFullScreenXRay ? 'fixed inset-0 z-[100] flex flex-col rounded-none' : ''}`}>
                  <div className="px-4 py-3 bg-indigo-600/10 border-b border-indigo-500/20 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Structural X-Ray Visualization</span>
                      {engineeringData.xRayTypology && (
                        <span className="text-[8px] font-bold text-indigo-300/60 uppercase">Detected Material: {engineeringData.xRayTypology}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setIsFullScreenXRay(!isFullScreenXRay)}
                        className="p-1.5 bg-slate-800 rounded-lg text-indigo-400 hover:text-white transition-colors"
                      >
                        {isFullScreenXRay ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={downloadXRay}
                        className="p-1.5 bg-slate-800 rounded-lg text-indigo-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className={`relative ${isFullScreenXRay ? 'flex-1 bg-black flex items-center justify-center' : ''}`}>
                    <img 
                      src={xRayImageUrl} 
                      className={`${isFullScreenXRay ? 'max-h-full max-w-full object-contain' : 'w-full aspect-video object-cover'}`} 
                      alt="Structural X-Ray" 
                    />
                  </div>
                  <div className="p-4 bg-slate-900/80 backdrop-blur-sm">
                    <p className="text-[10px] text-slate-300 font-medium mb-2">
                      BIM-standard visualization showing internal reinforcement and material layers as per IS codes.
                    </p>
                    <p className="text-[8px] text-slate-500 italic">
                      Note: This is an AI-generated conceptual visualization based on structural standards. Always refer to site-specific blueprints for construction.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative group">
                  <button 
                    onClick={handleGenerateXRay}
                    disabled={!canGenerateXRay || isXRayGenerated || isGeneratingXRay}
                    title={isXRayBlocked ? 'X-Ray visualization is only available for structural elements.' : ''}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase transition-all flex items-center justify-center space-x-2 ${
                      isXRayGenerated 
                        ? 'bg-green-600/20 text-green-500 border border-green-500/30 cursor-default' 
                        : isGeneratingXRay
                          ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 cursor-wait'
                          : canGenerateXRay 
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 active:scale-95' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isGeneratingXRay ? (
                      <>
                        <div className="w-3 h-3 border-2 border-indigo-400 border-t-white rounded-full animate-spin"></div>
                        <span>Simulating Internal Reinforcement...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✨</span>
                        <span>{isXRayGenerated ? 'X-Ray Generated' : 'View Structural X-Ray'}</span>
                      </>
                    )}
                  </button>
                  
                  {isXRayBlocked && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-400 uppercase font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      X-Ray visualization is only available for structural elements.
                    </div>
                  )}
                </div>

                <button onClick={generatePDFReport} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all">Download Technical Report</button>
              </div>
            </div>
          )}
          {activeTab === 'technical' && renderTechnicalTab()}
          {activeTab === 'inspection' && renderInspectionTab()}
          {activeTab === 'consult' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-slate-900 border border-theme rounded-3xl p-6">
                  <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2 italic">
                    MANUAL CONTENT RECTIFICATION
                  </h4>
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-6">
                    Review the AI analysis below and manually correct any engineering discrepancies.
                  </p>
                  
                  <div className="relative">
                    <textarea 
                      value={rectificationText}
                      onChange={(e) => setRectificationText(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-[11px] font-medium text-white h-[300px] outline-none focus:border-blue-500 transition-all resize-none shadow-inner scrollbar-hide"
                      placeholder="Start typing structural corrections..."
                    />
                    <div className="absolute top-4 right-4 flex space-x-1 opacity-20">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                  </div>

                  {!expandedContent['consult'] && renderExpandButton('consult', 'Generate Expert Addendum')}
                  {renderExpandedContent('consult')}

                  <div className="mt-6 flex flex-col space-y-3">
                    <button 
                      onClick={handleSaveRectification}
                      disabled={isSavingRectification}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all ${
                        isSavingRectification ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 active:scale-95'
                      }`}
                    >
                      {isSavingRectification ? (
                        <>
                          <div className="w-3 h-3 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
                          <span>Applying Changes...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Save & Update Report</span>
                        </>
                      )}
                    </button>
                    <p className="text-[8px] text-center text-slate-600 uppercase font-black">
                      Persistence active: Corrections stored in local memory bank.
                    </p>
                  </div>
               </div>

               <div className="bg-theme-card/50 border border-theme p-5 rounded-2xl flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-lg">💡</div>
                  <div className="flex-1">
                     <div className="text-[9px] font-black text-blue-500 uppercase italic">Engineering Tip</div>
                     <p className="text-[10px] text-slate-400 font-medium italic leading-tight">
                        Saved rectifications automatically sync with the Summary and PDF generation engine.
                     </p>
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="bg-theme-card rounded-3xl overflow-hidden border border-theme h-[500px]">
              <EngineeringChatbot context={engineeringData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
