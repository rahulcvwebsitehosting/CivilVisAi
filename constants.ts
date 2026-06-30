
import { KnowledgeTopic, AnalysisResult } from "./types.ts";

export const CIVIL_ENGINEER_SYSTEM_PROMPT = `
You are a Senior Lead Structural Engineer and Infrastructure Health Monitoring Expert.

CORE MISSION:
Perform high-precision structural analysis and defect detection for civil engineering assets. Your goal is to identify structural elements, assess their health, and provide actionable engineering insights based on international standards (IS, ACI, Eurocodes).

ANALYSIS PROTOCOL:
1. ELEMENT IDENTIFICATION: Precisely identify the structural component (e.g., Post-tensioned Beam, Pile Cap, Retaining Wall, Tower Crane).
2. DEFECT DETECTION: Meticulously scan for signs of distress:
   - Concrete: Cracks (Flexural, Shear, Thermal), Spalling, Honeycombing, Efflorescence, Corrosion (Rust staining).
   - Steel: Section loss, Pitting, Fatigue cracks, Connection failure (Bolts/Welds), Buckling.
   - Pavement: Potholes, Rutting, Alligator cracking, Raveling.
3. SEVERITY ASSESSMENT: Categorize defects as Minor (Maintenance), Moderate (Repair), or Critical (Structural Risk).
4. CAUSE & REMEDY: Provide root cause analysis and standard rectification methods (e.g., Epoxy injection, Micro-concreting, Jacketing).

TECHNICAL STANDARDS:
- Reference IS 456:2000 for Concrete.
- Reference IS 800:2007 for Steel.
- Reference IS 13920 for Ductile Detailing.
- Reference IS 1893 for Seismic considerations.

COMMUNICATION STYLE:
- Professional, technical, and authoritative.
- Use Markdown for structure.
- Be thorough but avoid fluff.
`;

export const LOCAL_ENGINEERING_FAQ: Record<string, string> = {
  "m25": "M25 refers to a concrete mix with a characteristic compressive strength of 25 N/mm² at 28 days. As per IS 456, the nominal mix ratio is approximately 1:1:2 (Cement:Sand:Aggregate).",
  "m20": "M20 concrete has a 20 N/mm² compressive strength. Nominal mix is 1:1.5:3. Used for general RCC works.",
  "slump": "The Slump Test measures the workability of fresh concrete. A standard slump for heavily reinforced sections is 75-125mm. High slump suggests excessive water-cement ratio.",
  "cracks": "Structural cracks (shear/flexure) usually require non-destructive testing (NDT). Horizontal cracks in columns often indicate corrosion or overstressing.",
  "honeycombing": "Honeycombing is caused by improper vibration or leaky shuttering. For structural repair, use non-shrink high-strength grout after removing loose concrete.",
  "crane": "Tower crane safety requires checking limit switches, wire rope tension, and ensuring wind speeds are below 72 km/h (20 m/s) for operation.",
  "is 456": "IS 456:2000 is the Indian Standard code of practice for Plain and Reinforced Concrete.",
  "is 800": "IS 800:2007 is the Indian Standard code of practice for General Construction in Steel."
};

export const CONCRETE_STANDARDS: Record<string, { ratio: string; cement: string; wc: string }> = {
  'M10': { ratio: '1:3:6', cement: '210 kg/m³', wc: '0.60' },
  'M15': { ratio: '1:2:4', cement: '250 kg/m³', wc: '0.55' },
  'M20': { ratio: '1:1.5:3', cement: '300 kg/m³', wc: '0.50' },
  'M25': { ratio: '1:1:2', cement: '320 kg/m³', wc: '0.45' },
  'M30': { ratio: 'Design Mix', cement: '340 kg/m³', wc: '0.45' },
  'M35': { ratio: 'Design Mix', cement: '360 kg/m³', wc: '0.40' },
  'M40': { ratio: 'Design Mix', cement: '380 kg/m³', wc: '0.40' },
};

export const EQUIPMENT_TEMPLATES: Record<string, any> = {
  'KODEN': {
    name: 'Koden Ultrasonic Monitor (DM-684)',
    capacity: 'Ultrasonic Depth Monitoring',
    boom: 'Winch-driven Probe',
    checklist: ['Transducer Calibration', 'Slurry Density Verification', 'Verticality Deviation < 1%'],
    swl_advice: 'Ensure probe centralizer is adjusted for borehole diameter (IS 2911 compliant).'
  },
  'TOWER_CRANE': {
    name: 'Tower Crane (Fixed/Slewing)',
    capacity: '12-25 Tons',
    boom: '40-60m Radius',
    checklist: ['Wire Rope Tension', 'Limit Switch Functionality', 'Operator Logbook'],
    swl_advice: 'Ensure wind speeds do not exceed 72 km/h for lifting operations.'
  },
  'EXCAVATOR': {
    name: 'Hydraulic Excavator',
    capacity: '1.2 m³ Bucket',
    boom: 'Standard Reach',
    checklist: ['Hydraulic Leaks', 'Track Tension', 'Swing Bearing Lubrication'],
    swl_advice: 'Maintain 2m safety clearance from trench edges.'
  },
  'PILING_RIG': {
    name: 'Rotary Piling Rig',
    capacity: '1200mm Pile Dia',
    boom: '30m Depth Mast',
    checklist: ['Mast Verticality', 'Kelly Bar Wear', 'Slurry Pump Integrity'],
    swl_advice: 'Verify soil bearing capacity before rig positioning.'
  }
};

export const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    icon: '📚',
    description: 'Mechanics, SOM, and Mathematics.',
    subcategories: [
      { id: 'intro', title: '1.1 Intro to Civil Eng.', items: ['History Timeline', 'Indian Heritage', 'Modern Marvels', 'Career Paths'] },
      { id: 'mech', title: '1.2 Engineering Mechanics', items: ['Statics: Force Systems', 'Dynamics: Kinematics', 'Friction', 'Centroid & MOI', 'Truss Analysis'] },
      { id: 'som', title: '1.3 Strength of Materials', items: ['Stress-Strain', 'SFD & BMD', 'Bending Stress', 'Torsion', 'Mohr\'s Circle', 'Columns & Struts'] },
      { id: 'math', title: '1.5 Engineering Math', items: ['Calculus', 'Differential Equations', 'Linear Algebra', 'Probability & Stats'] },
      { id: 'drawing', title: '1.6 Engineering Drawing', items: ['Projections', 'Sectional Views', 'CAD Software'] }
    ]
  },
  {
    id: 'structural',
    title: 'Structural Engineering',
    icon: '🏗️',
    description: 'RCC, Steel, and Dynamics.',
    subcategories: [
      { id: 'analysis', title: '2.1 Structural Analysis', items: ['Plastic Analysis', 'Stability Analysis', 'FEM Basics'] },
      { id: 'rcc', title: '2.2 RCC Design', items: ['Beam Design (Limit State)', 'Slab (One/Two-way)', 'Column Design', 'Retaining Walls', 'Water Tanks', 'Prestressed Concrete'] },
      { id: 'steel', title: '2.3 Steel Design', items: ['Bolted Connections', 'Welded Connections', 'Compression Members', 'Plate Girders', 'Industrial Buildings'] },
      { id: 'earthquake', title: '2.4 Earthquake Eng.', items: ['Seismic Analysis (IS 1893)', 'Ductile Detailing (IS 13920)', 'Base Isolation'] }
    ]
  },
  {
    id: 'building',
    title: 'Building Construction',
    icon: '🏛️',
    description: 'Materials and Techniques.',
    subcategories: [
      { id: 'mats', title: '3.2 Construction Materials', items: ['Cement Types', 'Aggregates', 'Concrete Mix Design', 'TMT Steel', 'Special Concretes'] },
      { id: 'tech', title: '3.3 Techniques', items: ['Formwork Design', 'Concreting', 'Plastering', 'Masonry Bond Patterns', 'Modern Methods (Precast)'] }
    ]
  },
  {
    id: 'management',
    title: 'Construction Management',
    icon: '🚧',
    description: 'Planning, Scheduling, and Safety.',
    subcategories: [
      { id: 'planning', title: '4.1 Project Planning', items: ['CPM & PERT', 'Resource Leveling', 'MS Project/Primavera'] },
      { id: 'safety', title: '4.2 Site Safety', items: ['PPE Standards', 'Excavation Safety', 'Working at Height'] }
    ]
  },
  {
    id: 'geotech',
    title: 'Geotechnical Eng.',
    icon: '🌊',
    description: 'Soil Mechanics & Foundations.',
    subcategories: [
      { id: 'soil', title: '5.1 Soil Mechanics', items: ['Soil Classification', 'Permeability', 'Shear Strength', 'Consolidation'] },
      { id: 'found', title: '5.2 Foundation Eng.', items: ['Bearing Capacity', 'Pile Foundations (IS 2911)', 'Slope Stability', 'Soil Improvement'] }
    ]
  },
  {
    id: 'transport',
    title: 'Transportation Eng.',
    icon: '🛣️',
    description: 'Highways, Traffic, and Pavements.',
    subcategories: [
      { id: 'highway', title: '6.1 Highway Design', items: ['Geometric Design', 'Pavement Materials', 'Flexible vs Rigid Pavements'] },
      { id: 'traffic', title: '6.2 Traffic Engineering', items: ['Traffic Flow', 'Signal Timing', 'Impact Assessment'] }
    ]
  },
  {
    id: 'hydraulics',
    title: 'Hydraulics & Water',
    icon: '💧',
    description: 'Fluid Mechanics & Irrigation.',
    subcategories: [
      { id: 'fluid', title: '7.1 Fluid Mechanics', items: ['Bernoulli\'s Equation', 'Flow Through Pipes', 'Open Channel Flow'] },
      { id: 'irrigation', title: '7.2 Irrigation Eng.', items: ['Canal Design', 'Dam Engineering', 'Hydrology'] }
    ]
  },
  {
    id: 'environmental',
    title: 'Environmental Eng.',
    icon: '🌍',
    description: 'Water Treatment & Waste.',
    subcategories: [
      { id: 'water', title: '8.1 Water Supply', items: ['Treatment Processes', 'Distribution Systems', 'Quality Standards'] },
      { id: 'waste', title: '8.2 Waste Management', items: ['Sewage Treatment', 'Solid Waste', 'EIA Reports'] }
    ]
  },
  {
    id: 'surveying',
    title: 'Surveying & Geomatics',
    icon: '📐',
    description: 'Theodolite, GPS, and GIS.',
    subcategories: [
      { id: 'basic', title: '9.1 Basic Surveying', items: ['Leveling', 'Theodolite', 'Contouring'] },
      { id: 'modern', title: '9.2 Modern Surveying', items: ['Total Station', 'GPS/GNSS', 'Drone Surveying', 'GIS'] }
    ]
  },
  {
    id: 'bridge',
    title: 'Bridge Engineering',
    icon: '🌉',
    description: 'Culverts, Girders, and IRC Loads.',
    subcategories: [
      { id: 'loads', title: '13.2 Design Loads', items: ['IRC Class A/70R', 'Impact Factors', 'Seismic IRC:SP:114'] },
      { id: 'deck', title: '13.3 Deck Design', items: ['Slab Bridges', 'T-Beam Girders', 'Load Distribution'] },
      { id: 'sub', title: '13.5 Substructure', items: ['Abutments', 'Piers', 'Bearings', 'Foundations'] }
    ]
  },
  {
    id: 'metro',
    title: 'Metro & Tunnel Eng.',
    icon: '🚇',
    description: 'TBM, NATM, and Metro Stations.',
    subcategories: [
      { id: 'tbm', title: '14.2 Bored Tunneling', items: ['TBM Types (EPB, Slurry)', 'Excavation Cycle', 'Segment Erection', 'Grouting'] },
      { id: 'station', title: '14.4 Station Design', items: ['Box Structure', 'Cut and Cover', 'MEP Systems'] },
      { id: 'natm', title: '14.3 NATM', items: ['Principles', 'Support Systems', 'Monitoring'] }
    ]
  },
  {
    id: 'industrial',
    title: 'Industrial Structures',
    icon: '🏭',
    description: 'Chimneys, Silos, and Sheds.',
    subcategories: [
      { id: 'sheds', title: '15.1 Industrial Sheds', items: ['Portal Frames', 'Crane Girders', 'Gantry Girders'] },
      { id: 'special', title: '15.3 Chimneys & Silos', items: ['RCC Chimneys', 'Silo Wall Design', 'Machine Foundations'] }
    ]
  },
  {
    id: 'coastal',
    title: 'Coastal & Offshore',
    icon: '🌊',
    description: 'Harbors, Waves, and Jetties.',
    subcategories: [
      { id: 'harbor', title: '16.1 Harbor Eng.', items: ['Breakwaters', 'Berthing Structures', 'Dredging'] },
      { id: 'waves', title: '16.2 Wave Mechanics', items: ['Wave Theories', 'Wave Forces', 'Coastal Protection'] }
    ]
  },
  {
    id: 'sustainable',
    title: 'Sustainable Building',
    icon: '♻️',
    description: 'Green Materials & LEED.',
    subcategories: [
      { id: 'green', title: '17.1 Green Concepts', items: ['LEED/GRIHA', 'Net Zero Buildings', 'Energy Modeling'] },
      { id: 'mats', title: '17.3 Green Materials', items: ['Fly Ash Concrete', 'Bamboo', 'Recycled Aggregates'] }
    ]
  },
  {
    id: 'equipment',
    title: 'Construction Equipment',
    icon: '🔧',
    description: 'Excavators, Cranes, and TBMs.',
    subcategories: [
      { id: 'earth', title: '18.1 Earthmoving', items: ['Excavators', 'Bulldozers', 'Graders'] },
      { id: 'lifting', title: '18.2 Lifting', items: ['Tower Cranes', 'Mobile Cranes', 'Hoists'] },
      { id: 'tunnel', title: '18.6 Tunneling', items: ['TBM Components', 'Roadheaders', 'Drill & Blast'] }
    ]
  },
  {
    id: 'site',
    title: 'Site Engineering',
    icon: '📋',
    description: 'Practices, Quality, and Safety.',
    subcategories: [
      { id: 'prep', title: '19.1 Site Prep', items: ['Layout Planning', 'Temporary Works', 'Dewatering'] },
      { id: 'quality', title: '19.4 Quality Control', items: ['Checklists', 'Material Testing', 'Defect ID'] }
    ]
  },
  {
    id: 'quantity',
    title: 'Quantity Surveying',
    icon: '💰',
    description: 'Costing, BBS, and Tenders.',
    subcategories: [
      { id: 'estimation', title: '20.1 Estimation', items: ['Taking Off', 'Rate Analysis', 'Detailed Estimates'] },
      { id: 'bbs', title: '20.2 BBS', items: ['Shape Codes', 'Cutting Lengths', 'Rebar Optimization'] },
      { id: 'contracts', title: '20.8 Contracts', items: ['Tendering', 'Bill of Quantities', 'EPC/BOT'] }
    ]
  },
  {
    id: 'bim',
    title: 'BIM & Tech',
    icon: '🏗️',
    description: 'Revit, Tekla, and Digital Twins.',
    subcategories: [
      { id: 'bim_core', title: '21.1 BIM Core', items: ['LOD Levels', 'Clash Detection', '4D/5D BIM'] },
      { id: 'software', title: '21.2 Software', items: ['Revit Structural', 'Tekla Structures', 'Navisworks'] },
      { id: 'future', title: '21.4 Future Tech', items: ['3D Printing', 'Drones', 'IoT Sensors'] }
    ]
  },
  {
    id: 'special_struct',
    title: 'Special Structures',
    icon: '⚡',
    description: 'High-Rise, Shells, and Pools.',
    subcategories: [
      { id: 'highrise', title: '22.1 High-Rise', items: ['Outriggers', 'Tube Systems', 'Diagrid'] },
      { id: 'shells', title: '22.2 Shells & Domes', items: ['Space Frames', 'Tension Structures', 'Folded Plates'] }
    ]
  },
  {
    id: 'cases',
    title: 'Real-World Cases',
    icon: '🎯',
    description: 'Successes and Failures.',
    subcategories: [
      { id: 'success', title: '23.1 Success Stories', items: ['Atal Tunnel', 'Chenab Bridge', 'MTHL'] },
      { id: 'failure', title: '23.2 Failures', items: ['Tacoma Narrows', 'Dam Failures', 'Lessons Learned'] },
      { id: 'metro_case', title: '23.4 Metro Deep Dive', items: ['Madhavaram Metro (TATA Projects)', 'Chennai Metro Phase 2'] }
    ]
  },
  {
    id: 'research',
    title: 'Research & Innovation',
    icon: '🔬',
    description: 'Graphene, Self-healing, and AI.',
    subcategories: [
      { id: 'mats_res', title: '24.1 New Materials', items: ['Self-healing Concrete', 'Graphene Concrete', 'Bio-bricks'] },
      { id: 'ai_res', title: '24.3 Digital Innovation', items: ['AI in Design', 'Generative Design', 'Blockchain in AEC'] }
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
        items: ['React 19 & TypeScript', 'Tailwind CSS (Blueprint UI)', 'Gemini 3 Flash (Analysis)', 'Gemini 2.5 Flash Image (X-Ray)'] 
      },
      { 
        id: 'process', 
        title: 'AI Pipeline', 
        items: ['Step 1: Image Pre-processing', 'Step 2: SHA-256 Hashing', 'Step 3: Typology-Aware Inference', 'Step 4: BIM-Style X-Ray Generation'] 
      },
      { 
        id: 'refs', 
        title: 'Engineering References', 
        items: ['IS 456:2000 (Concrete)', 'IS 800:2007 (Steel)', 'IS 13920 (Ductile Detailing)', 'IS 1893 (Seismic Design)'] 
      }
    ]
  }
];

// Fix: Export MOCK_ANALYSES to resolve import error in App.tsx
export const MOCK_ANALYSES: AnalysisResult[] = [];
