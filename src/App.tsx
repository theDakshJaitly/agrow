import React, { useState } from 'react';
import { Header } from './components/Header';
import { AudioUpload } from './components/AudioUpload';
import { PipelineVisualization } from './components/PipelineVisualization';
import { Results } from './components/Results';
import { PipelineStep, ProcessingResult } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleAudioUpload = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    
    // Simulate the pipeline steps
    const steps: PipelineStep[] = ['stt', 'translation', 'llm', 'back-translation', 'tts'];
    
    for (const step of steps) {
      setCurrentStep(step);
      // Simulate processing time for each step
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Simulate final result
    const mockResult: ProcessingResult = {
      originalText: "मैं अपनी फसल की उपज कैसे बढ़ा सकता हूं?",
      translatedQuery: "How can I increase my crop yield?",
      llmResponse: "To increase crop yield, consider: 1) Use quality seeds 2) Proper soil preparation 3) Balanced fertilization 4) Adequate irrigation 5) Pest management 6) Crop rotation",
      finalResponse: "फसल की उपज बढ़ाने के लिए: 1) गुणवत्तापूर्ण बीज का उपयोग करें 2) मिट्टी की उचित तैयारी 3) संतुलित उर्वरीकरण 4) पर्याप्त सिंचाई 5) कीट प्रबंधन 6) फसल चक्र",
      detectedLanguage: "Hindi",
      processingTime: "12.5s"
    };
    
    setResult(mockResult);
    setCurrentStep('completed');
    setIsProcessing(false);
  };

  const handleReset = () => {
    setCurrentStep('idle');
    setIsProcessing(false);
    setResult(null);
  };

  return (
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
  );
}

export default App;