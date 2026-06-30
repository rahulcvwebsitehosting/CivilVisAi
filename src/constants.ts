import { KnowledgeTopic, AnalysisResult } from './types';

export const CIVIL_ENGINEER_SYSTEM_PROMPT = `You are a Senior Structural Engineer expert in Indian Standard (IS) codes. 
Analyze the provided construction site image and provide a detailed technical report.
Focus on structural integrity, material quality, and compliance with IS 456, IS 800, and other relevant codes.
Be precise, technical, and professional.`;

export const MOCK_ANALYSES: AnalysisResult[] = [
  {
    id: 'mock_1',
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><path d="M10 10 h80 v80 h-80 z M10 50 h80 M50 10 v80" stroke="%233b82f6" stroke-width="0.5" stroke-dasharray="2,2"/><circle cx="50" cy="50" r="35" fill="none" stroke="%233b82f6" stroke-width="1"/><text x="15" y="25" fill="%233b82f6" font-family="monospace" font-size="6">BEAM CL-2</text><text x="55" y="85" fill="%2310b981" font-family="monospace" font-size="6">M25 OK</text></svg>`,
    imageHash: 'mock_hash_1',
    data: {
      elementName: "Monolithic Beam-Slab Junction (M25)",
      elementCategory: "STRUCTURE",
      confidenceScore: 0.94,
      healthScore: 92,
      executiveSummary: {
        brief: "Detailed routine structural audit of continuous monolithic slab-to-beam connection. Reinforcement layout matches typical ductility standards under IS 456 / IS 13920. Surface aggregate packing and slump homogeneity are excellent with no honeycomb formation.",
        keyEngineeringPoints: [
          "Zero surface voids or plastic settlement cracking along tensile face.",
          "Clear cover meets the prescribed 25mm threshold for moderate exposure criteria.",
          "Steel tie spacing verified at 150mm c/c spacing."
        ]
      },
      isCodeReferences: ["IS 456:2000", "IS 13920"],
      defects: [],
      constructionMethodology: {
        methodSummary: "Continuous monolithic concrete casting with standard steel ply shuttering.",
        concreteSpecs: {
          grade: "M25",
          mixDesign: [
            { material: "PPC Cement", quantity: "360 kg/m³", proportion: "1" },
            { material: "Coarse Aggregate", quantity: "1160 kg/m³", proportion: "3.2" },
            { material: "Fine Aggregate", quantity: "660 kg/m³", proportion: "1.8" }
          ]
        }
      },
      recommendations: [
        "Sustain standard wet ponding curing routine for a minimum of 10 days.",
        "Perform a non-destructive rebound hammer test at 28 days to verify design compressive strength."
      ]
    }
  },
  {
    id: 'mock_2',
    timestamp: Date.now() - 3600000 * 48, // 2 days ago
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><path d="M20 20 l60 60 M80 20 l-60 60" stroke="%23f43f5e" stroke-width="1"/><path d="M10 10 h80 v80 h-80 z" stroke="%233b82f6" stroke-width="0.5"/><text x="15" y="25" fill="%23f43f5e" font-family="monospace" font-size="6">LOSS DETECTED</text><text x="15" y="85" fill="%2394a3b8" font-family="monospace" font-size="6">IS 800 CORROSION</text></svg>`,
    imageHash: 'mock_hash_2',
    data: {
      elementName: "Heavy I-Beam Column Girders",
      elementCategory: "STRUCTURE",
      confidenceScore: 0.89,
      healthScore: 58,
      executiveSummary: {
        brief: "Steel column assembly under moderate weathering conditions. Visual analysis identifies significant surface flaking and oxide build-up on the lower tension flange. Corrosion is classified as Grade C, with an estimated structural section loss of 8-10%.",
        keyEngineeringPoints: [
          "Oxide layer accumulation visible along the lower flange edge.",
          "Web section appears fully integral without buckling or axial twisting.",
          "Structural fasteners (HTFG bolts) are structurally tight but exhibit surrounding localized rust."
        ]
      },
      isCodeReferences: ["IS 800:2007"],
      defects: [
        {
          type: "Grade C Surface Oxidation",
          severity: "HIGH",
          cause: "Prolonged exposure to pooling rainwater runoff without protective anti-corrosive coating maintenance.",
          remedy: "Brush clear with high-speed wire mechanical scraper, prime with epoxy zinc-phosphate, and apply two layers of synthetic polyurethane."
        }
      ],
      constructionMethodology: {
        methodSummary: "Pre-assembled rolled steel ISMB 400 section bolted onto foundation masonry pedestal.",
        machinerySpecs: {
          liftingCapacity: "12 Metric Tons",
          boomLength: "18 Meters",
          safetyFactor: "2.2"
        }
      },
      recommendations: [
        "Conduct ultrasonic thickness measurement across flange rows to map localized plate thinning.",
        "Ensure structural loads are recalculated if section thinning exceeds 10% design threshold."
      ]
    }
  }
];

export const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'concrete',
    title: 'Concrete Tech',
    icon: '🏗️',
    description: 'RCC Design, Curing & IS 456 Standards.',
    subcategories: [
      { id: 'mix', title: '1.1 Mix Design', items: ['Grade Selection (M20-M80)', 'Water-Cement Ratio (IS 10262)', 'Superplasticizer Dosage & Slump Correlation', 'Air Entraining Agents for Freeze-Thaw Resistance'] },
      { id: 'reinforce', title: '1.2 Reinforcement', items: ['Ductile Detailing (IS 13920)', 'Lap Lengths & Tension Splices', 'Nominal Cover Requirements (20mm-75mm)', 'Development Length (Ld) Calculations'] },
      { id: 'curing', title: '1.3 Curing Protocols', items: ['Steam Curing vs Wet Ponding', 'Curing Timelines for OPC vs PPC Cement', 'Plastic Shrinkage Crack Mitigation', 'Formwork Stripping Timelines (IS 456 Cl 26.3)'] }
    ]
  },
  {
    id: 'steel',
    title: 'Steel Structures',
    icon: '🌉',
    description: 'Steel Design & IS 800 Standards.',
    subcategories: [
      { id: 'connections', title: '2.1 Connections', items: ['Welded Joints (Throat Thickness & Length)', 'HTFG Bolted Connections', 'Gusset Plate Buckling Resistance', 'Splice Plate Alignment'] },
      { id: 'sections', title: '2.2 Sections & Buckling', items: ['I-Beams & Channel Sections', 'Built-up Columns & Lacings/Battens', 'Lateral Torsional Buckling Limits', 'Slenderness Ratio (KL/r) thresholds'] }
    ]
  },
  {
    id: 'soil_mechanics',
    title: 'Soil & Foundations',
    icon: '🪵',
    description: 'Foundation Engineering & IS 1904/2911.',
    subcategories: [
      { id: 'bearing', title: '3.1 Bearing Capacity', items: ['Terzaghi Theory & Shape Factors', 'Standard Penetration Test (SPT) N-Value Correction', 'Differential Settlement Thresholds in Clay vs Sand', 'Plate Load Test Protocol'] },
      { id: 'piles', title: '3.2 Deep Foundations', items: ['Pile Load Capacity (IS 2911 Part 1)', 'Skin Friction vs End Bearing Contribution', 'Negative Skin Friction in Soft Soils', 'Pile Group Efficiency & Settlement'] }
    ]
  },
  {
    id: 'seismic',
    title: 'Seismic Design',
    icon: '🌋',
    description: 'Seismic Load Analysis & IS 1893.',
    subcategories: [
      { id: 'seismic_analysis', title: '4.1 Equivalent Static', items: ['Seismic Zone Factors (Zone II to V)', 'Response Reduction Factor (R Values)', 'Importance Factor (I) Classification', 'Response Spectrum Analysis (IS 1893 Part 1)'] },
      { id: 'shear_walls', title: '4.2 Lateral Systems', items: ['Shear Wall Placement & Stiffness Symmetry', 'Boundary Elements Detailing', 'Soft Storey Deflection Limits', 'Torsional Irregularity Checks'] }
    ]
  },
  {
    id: 'testing',
    title: 'Concrete NDT',
    icon: '🔬',
    description: 'Non-Destructive Testing Procedures.',
    subcategories: [
      { id: 'ndt_methods', title: '5.1 Field Tests', items: ['Rebound Hammer Test (Surface Hardness)', 'Ultrasonic Pulse Velocity (UPV - Homogeneity)', 'Rebar Locator & Covermeter Scanning', 'Core Extraction & Lab Compressive Verification'] },
      { id: 'destructive', title: '5.2 Laboratory QA', items: ['7-Day and 28-Day Cube Compression', 'Flexural Strength Prism Testing', 'Rapid Chloride Permeability Test (RCPT)', 'Water Absorption Limits for Structural concrete'] }
    ]
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    icon: '💻',
    description: 'Tech Stack & AI Methodology.',
    subcategories: [
      { 
        id: 'stack', 
        title: 'Tech Stack', 
        items: ['React 18 with Vite & TypeScript', 'Tailwind CSS (Adaptive Blueprint UI)', 'Gemini Model Pipelines', 'Local Storage Persistence Engine', 'Interactive Compressive Strength Simulator'] 
      },
      { 
        id: 'process', 
        title: 'AI Pipeline', 
        items: ['Step 1: Client-Side Image Pre-processing', 'Step 2: SHA-256 Memory Hashing', 'Step 3: Offline Diagnostic Fallback', 'Step 4: JSON-Guided Report Synthesizer'] 
      },
      { 
        id: 'refs', 
        title: 'Engineering References', 
        items: ['IS 456:2000 (Plain & Reinforced Concrete)', 'IS 800:2007 (General Steel Construction)', 'IS 13920:2016 (Ductile Detailing)', 'IS 1893:2016 (Earthquake Resistant Criteria)', 'IS 2911:2010 (Pile Foundation Design)'] 
      }
    ]
  }
];
