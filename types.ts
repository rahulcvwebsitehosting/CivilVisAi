
export enum AppMode {
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
  UPLOAD = 'UPLOAD',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSIONAL = 'PROFESSIONAL',
  INTERN = 'INTERN'
}

export interface Defect {
  type: string;
  severity: 'Low' | 'Medium' | 'Critical';
  cause: string;
  remedy: string;
}

export interface ExecutiveSummary {
  brief: string;
  keyEngineeringPoints: string[];
}

export interface MixDesignItem {
  material: string;
  proportion: string;
  quantity: string;
}

export interface ConstructionMethodology {
  methodSummary: string;
  concreteSpecs?: {
    grade: string;
    mixDesign: MixDesignItem[];
    shutteringType?: string;
    reinforcementDensity?: string;
  };
  machinerySpecs?: {
    liftingCapacity: string;
    boomLength: string;
    counterweight: string;
    safetyFactor: string;
  };
}

export interface LabExperiment {
  name: string;
  apparatus: string[];
  procedure: string[];
  standards: string[];
}

export interface StructuralAnalysis {
  elementName: string;
  elementCategory: 'EXPERIMENT' | 'STRUCTURE' | 'MACHINERY' | 'PAVEMENT' | 'UNDEFINED' | 'UNKNOWN';
  confidenceScore: number;
  executiveSummary: ExecutiveSummary;
  isCodeReferences: string[];
  defects: Defect[];
  constructionMethodology?: ConstructionMethodology;
  labExperiment?: LabExperiment;
  recommendations: string[];
  isCorrection?: boolean;
  originalData?: Partial<StructuralAnalysis>;
  contentOverrides?: Record<string, string>;
  healthScore?: number; // 0-100 score representing structural integrity
  // Fix: Added missing properties to match usage in Home.tsx and EngineeringChatbot.tsx
  id?: string;
  materialDetails?: string;
  costEstimate?: string;
  xRayImageUrl?: string;
  xRayTypology?: 'Steel' | 'Concrete';
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  image: string;
  imageHash: string;
  data: StructuralAnalysis;
}

export interface KnowledgeTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  subcategories?: KnowledgeSubcategory[];
}

export interface KnowledgeSubcategory {
  id: string;
  title: string;
  items: string[];
}

export interface TranscriptionItem {
  speaker: 'user' | 'model';
  text: string;
}