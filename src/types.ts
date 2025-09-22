export type PipelineStep = 
  | 'idle' 
  | 'stt' 
  | 'translation' 
  | 'llm' 
  | 'back-translation' 
  | 'tts' 
  | 'completed';

export interface ProcessingResult {
  originalText: string;
  translatedQuery: string;
  llmResponse: string;
  finalResponse: string;
  detectedLanguage: string;
  processingTime: string;
  audioUrl?: string;
}

export interface PipelineStepInfo {
  id: PipelineStep;
  title: string;
  description: string;
  icon: string;
}