const API_BASE_URL = 'http://localhost:3001/api';

export interface ProcessingResponse {
  status: 'processing' | 'completed' | 'error';
  message?: string;
  processingId?: string;
  outputFile?: string;
  error?: string;
}

export interface PipelineStatus {
  status: 'processing' | 'completed' | 'error';
  currentStep?: string;
  steps?: Record<string, any>;
  result?: any;
  error?: string;
  outputFile?: string;
}

export class ApiService {
  static async processAudio(
    file: File, 
    sourceLanguage: string = 'auto', 
    targetLanguage: string = 'en'
  ): Promise<ProcessingResponse> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    try {
      const response = await fetch(`${API_BASE_URL}/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }

  static async getProcessingStatus(processingId: string): Promise<PipelineStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${processingId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }

  static async getLogs(): Promise<{ logs: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting logs:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}