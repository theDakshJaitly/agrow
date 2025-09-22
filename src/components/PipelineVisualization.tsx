import React from 'react';
import { 
  Mic, 
  Languages, 
  Bot, 
  ArrowLeftRight, 
  Volume2, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { PipelineStep, PipelineStepInfo } from '../types';

interface PipelineVisualizationProps {
  currentStep: PipelineStep;
  isProcessing: boolean;
  stepData?: Record<string, any>;
}

const stepInfo: PipelineStepInfo[] = [
  {
    id: 'stt',
    title: 'Speech-to-Text',
    description: 'Converting audio to text using ElevenLabs',
    icon: 'mic'
  },
  {
    id: 'translation',
    title: 'Translation',
    description: 'Translating to English using Sarvam AI',
    icon: 'languages'
  },
  {
    id: 'llm',
    title: 'AI Processing',
    description: 'Generating response using Groq LLM',
    icon: 'bot'
  },
  {
    id: 'back-translation',
    title: 'Back Translation',
    description: 'Translating back to original language',
    icon: 'arrow-left-right'
  },
  {
    id: 'tts',
    title: 'Text-to-Speech',
    description: 'Converting text to audio using ElevenLabs',
    icon: 'volume'
  }
];

const getIcon = (iconName: string, isActive: boolean, isCompleted: boolean) => {
  const className = `w-6 h-6 ${
    isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'
  }`;
  
  switch (iconName) {
    case 'mic': return <Mic className={className} />;
    case 'languages': return <Languages className={className} />;
    case 'bot': return <Bot className={className} />;
    case 'arrow-left-right': return <ArrowLeftRight className={className} />;
    case 'volume': return <Volume2 className={className} />;
    default: return <Mic className={className} />;
  }
};

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({ 
  currentStep, 
  isProcessing,
  stepData = {}
}) => {
  const getStepStatus = (stepId: PipelineStep) => {
    if (currentStep === 'idle') return 'pending';
    if (currentStep === 'completed') return 'completed';
    
    // Check step data for more accurate status
    if (stepData[stepId]) {
      return stepData[stepId].status;
    }
    
    const stepIndex = stepInfo.findIndex(step => step.id === stepId);
    const currentIndex = stepInfo.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepPreview = (stepId: PipelineStep) => {
    if (stepData[stepId] && stepData[stepId].data) {
      const data = stepData[stepId].data;
      if (typeof data === 'string') {
        return data.length > 100 ? data.substring(0, 100) + '...' : data;
      }
    }
    return null;
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Bot className="w-5 h-5 mr-2 text-blue-600" />
        Pipeline Processing
      </h2>
      
      <div className="space-y-4">
        {stepInfo.map((step, index) => {
          const status = getStepStatus(step.id);
          const isActive = status === 'active';
          const isCompleted = status === 'completed';
          const isSkipped = status === 'skipped';
          const preview = getStepPreview(step.id);
          
          return (
            <div key={step.id} className="relative">
              <div className={`flex items-start space-x-4 p-4 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-blue-50 border-l-4 border-blue-500' :
                isCompleted ? 'bg-green-50 border-l-4 border-green-500' :
                isSkipped ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                'bg-gray-50 border-l-4 border-gray-200'
              }`}>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-100' :
                  isActive ? 'bg-blue-100' :
                  isSkipped ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : isSkipped ? (
                    <span className="text-yellow-600 text-xs font-bold">SKIP</span>
                  ) : isActive && isProcessing ? (
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    getIcon(step.icon, isActive, isCompleted)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium ${
                    isCompleted ? 'text-green-800' :
                    isActive ? 'text-blue-800' :
                    isSkipped ? 'text-yellow-800' :
                    'text-gray-600'
                  }`}>
                    {step.title}
                    {isActive && isProcessing && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        Processing...
                      </span>
                    )}
                    {isCompleted && (
                      <span className="ml-2 text-sm font-normal text-green-600">
                        Completed
                      </span>
                    )}
                    {isSkipped && (
                      <span className="ml-2 text-sm font-normal text-yellow-600">
                        Skipped
                      </span>
                    )}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    isCompleted ? 'text-green-600' :
                    isActive ? 'text-blue-600' :
                    isSkipped ? 'text-yellow-600' :
                    'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                  {preview && (
                    <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-700">
                      <strong>Preview:</strong> {preview}
                    </div>
                  )}
                </div>
              </div>
              
              {index < stepInfo.length - 1 && (
                <div className={`w-0.5 h-4 ml-10 ${
                  isCompleted || isSkipped ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      {currentStep === 'completed' && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Processing Complete!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your agricultural query has been processed and the response is ready.
          </p>
        </div>
      )}
    </div>
  );
};