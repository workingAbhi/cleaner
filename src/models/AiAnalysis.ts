export type AiAnalysisStatus =
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface AiAnalysisJson {
  inspectionItem?: string;
  facility?: string;
  score?: number;
  status?: 'PASS' | 'FAIL';
  confidence?: number;
  criteria?: Record<string, number>;
  issues?: string[];
  recommendations?: string[];
  notVisible?: string[];
  error?: string;
}

export interface AiAnalysis {
  id: string;
  inspectionImageId: string;
  roId: string;
  inspectionItem: string;
  modelName?: string;
  score?: number;
  confidence?: number;
  status: AiAnalysisStatus;
  analysisJson: AiAnalysisJson;
  createdAt: string;
}
