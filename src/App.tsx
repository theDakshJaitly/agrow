import React, { useState } from 'react';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { AudioUpload } from './components/AudioUpload';
import { PipelineVisualization } from './components/PipelineVisualization';
import { Results } from './components/Results';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PipelineStep, ProcessingResult } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAudioUpload = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setResult(null);
    setProcessingId(null);
  };

  const handleReset = () => {
    setCurrentStep('idle');
    setIsProcessing(false);
    setResult(null);
    setError(null);
    setProcessingId(null);
  };

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI-Powered Helpline for Indian Farmers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your audio query in any Indian language and get intelligent agricultural advice 
            powered by AI, translated back to your native language.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <h3 className="font-medium text-red-800">Processing Error</h3>
                </div>
                <p className="text-red-700 text-sm mt-2">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
            
            <AudioUpload 
              onUpload={handleAudioUpload} 
              isProcessing={isProcessing}
              onReset={handleReset}
            />
            
            {result && (
              <Results result={result} />
            )}
          </div>
          
          <div>
            <PipelineVisualization 
              currentStep={currentStep}
              isProcessing={isProcessing}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Record Your Query</h3>
              <p className="text-gray-600 text-sm">
                Speak your agricultural question in Hindi, Punjabi, Tamil, or any supported Indian language
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                Our AI understands your query, processes it through advanced language models, and generates helpful advice
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔊</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Get Audio Response</h3>
              <p className="text-gray-600 text-sm">
                Receive intelligent agricultural guidance in your native language as both text and audio
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;