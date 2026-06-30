export enum AppMode {
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
  UPLOAD = 'UPLOAD',
  KNOWLEDGE = 'KNOWLEDGE',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}

export enum UserRole {
  STUDENT = 'STUDENT',
  INTERN = 'INTERN',
  ENGINEER = 'ENGINEER'
}

export interface StructuralAnalysis {
  elementName: string;
  elementCategory: 'EXPERIMENT' | 'STRUCTURE' | 'MACHINERY' | 'PAVEMENT' | 'UNDEFINED';
  confidenceScore: number;
  healthScore: number;
  executiveSummary: {
    brief: string;
    keyEngineeringPoints: string[];
  };
  isCodeReferences: string[];
  defects: {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    cause: string;
    remedy: string;
  }[];
  constructionMethodology: {
    methodSummary: string;
    concreteSpecs?: {
      grade: string;
      mixDesign: { material: string; quantity: string; proportion: string }[];
    };
    machinerySpecs?: {
      liftingCapacity: string;
      boomLength: string;
      safetyFactor: string;
    };
  };
  recommendations: string[];
  xRayImageUrl?: string;
  xRayTypology?: 'Steel' | 'Concrete';
  isCorrection?: boolean;
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
  subcategories: KnowledgeSubcategory[];
}

export interface KnowledgeSubcategory {
  id: string;
  title: string;
  items: string[];
}
