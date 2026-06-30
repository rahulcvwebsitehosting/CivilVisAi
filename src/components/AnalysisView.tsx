import React, { useState, useEffect } from 'react';
import { AnalysisResult, UserRole } from '../types';
import { expandAnalysisSection, generateStructuralXRay, saveCorrection } from '../services/gemini';
import { ChevronLeft, FileText, Shield, Wrench, Download, Zap, Info, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  onBack: () => void;
  role: UserRole;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onBack, role }) => {
  const [engineeringData, setEngineeringData] = useState(analysis.data);
  const [isGeneratingXRay, setIsGeneratingXRay] = useState(false);
  const [expandedContent, setExpandedContent] = useState<Record<string, string>>({});
  const [isExpanding, setIsExpanding] = useState<Record<string, boolean>>({});

  const handleExpand = async (section: 'summary' | 'technical' | 'inspection' | 'consult') => {
    if (isExpanding[section]) return;
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
    if (isGeneratingXRay || engineeringData.xRayImageUrl) return;
    setIsGeneratingXRay(true);
    try {
      const { imageUrl, typology } = await generateStructuralXRay(engineeringData);
      const updatedData = { ...engineeringData, xRayImageUrl: imageUrl, xRayTypology: typology };
      setEngineeringData(updatedData);
      saveCorrection(analysis.imageHash, updatedData);
    } catch (e) {
      console.error("X-Ray failed", e);
    } finally {
      setIsGeneratingXRay(false);
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("CivilVision AI Structural Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Element: ${engineeringData.elementName}`, 20, 30);
    doc.text(`Category: ${engineeringData.elementCategory}`, 20, 40);
    doc.text(`Confidence: ${(engineeringData.confidenceScore * 100).toFixed(0)}%`, 20, 50);
    doc.save(`CivilVision_Report_${analysis.id}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono overflow-y-auto scrollbar-hide">
      <div className="px-6 py-4 flex items-center justify-between bg-slate-900 border-b border-blue-500/20 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <div className="text-[8px] text-blue-500 uppercase font-black tracking-[0.2em]">Analysis Report</div>
          <div className="text-xs font-bold uppercase truncate max-w-[150px]">{engineeringData.elementName}</div>
        </div>
        <button onClick={downloadReport} className="p-2 text-blue-500"><Download size={20} /></button>
      </div>

      <div className="p-6 space-y-8">
        <div className="relative group">
          <img src={analysis.image} className="w-full aspect-video object-cover rounded-3xl border border-slate-800 shadow-2xl" alt="Site" />
          <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center">
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${engineeringData.confidenceScore > 0.8 ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
            {(engineeringData.confidenceScore * 100).toFixed(0)}% Confidence
          </div>
          {engineeringData.isCorrection && (
            <div className="absolute top-4 left-4 bg-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Memory Hit</div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center"><FileText size={14} className="mr-2" /> Executive Summary</h3>
              <button onClick={() => handleExpand('summary')} className="text-[8px] font-black uppercase text-slate-500 hover:text-blue-500 transition-colors">{isExpanding['summary'] ? 'Processing...' : 'Expand Analysis'}</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{engineeringData.executiveSummary.brief}</p>
            {expandedContent['summary'] && (
              <div className="mt-4 p-4 bg-slate-950/50 rounded-2xl text-[10px] text-slate-400 leading-relaxed border border-slate-800/50 animate-in fade-in slide-in-from-top-2">
                <ReactMarkdown>{expandedContent['summary']}</ReactMarkdown>
              </div>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center"><Zap size={14} className="mr-2" /> Structural X-Ray</h3>
              {!engineeringData.xRayImageUrl && (
                <button onClick={handleGenerateXRay} disabled={isGeneratingXRay} className="text-[8px] bg-blue-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-blue-500 transition-colors disabled:opacity-50">
                  {isGeneratingXRay ? 'Generating...' : 'Generate X-Ray'}
                </button>
              )}
            </div>
            {engineeringData.xRayImageUrl ? (
              <div className="space-y-4">
                <img src={engineeringData.xRayImageUrl} className="w-full rounded-2xl border border-slate-800" alt="X-Ray" />
                <div className="flex items-center justify-between px-2">
                  <span className="text-[8px] font-black uppercase text-slate-500">Typology: {engineeringData.xRayTypology}</span>
                  <span className="text-[8px] font-black uppercase text-emerald-500">BIM Rendering Active</span>
                </div>
              </div>
            ) : (
              <div className="h-40 bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                <Info size={24} className="text-slate-700 mb-2" />
                <p className="text-[9px] text-slate-600 uppercase font-bold">Generate internal structural view to see rebar/steel details</p>
              </div>
            )}
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-6 flex items-center"><Shield size={14} className="mr-2" /> IS Code Compliance</h3>
            <div className="flex flex-wrap gap-2">
              {engineeringData.isCodeReferences.map((code, i) => (
                <span key={i} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300">{code}</span>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-6 flex items-center"><AlertTriangle size={14} className="mr-2" /> Defect Analysis</h3>
            <div className="space-y-4">
              {engineeringData.defects.length === 0 ? (
                <p className="text-[10px] text-slate-500 uppercase font-bold">No critical defects detected</p>
              ) : (
                engineeringData.defects.map((defect, i) => (
                  <div key={i} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-white uppercase">{defect.type}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded ${defect.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>{defect.severity}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-2"><span className="text-slate-600">CAUSE:</span> {defect.cause}</p>
                    <p className="text-[10px] text-blue-400 leading-relaxed"><span className="text-blue-900">REMEDY:</span> {defect.remedy}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
