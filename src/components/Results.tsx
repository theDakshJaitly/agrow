import React, { useState } from 'react';
import { 
  MessageSquare, 
  Languages, 
  Bot, 
  Volume2, 
  Copy, 
  Download,
  Clock,
  Globe
} from 'lucide-react';
import { ProcessingResult } from '../types';

interface ResultsProps {
  result: ProcessingResult;
}

export const Results: React.FC<ResultsProps> = ({ result }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const ResultCard: React.FC<{
    title: string;
    content: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    field: string;
  }> = ({ title, content, icon, bgColor, textColor, field }) => (
    <div className={`${bgColor} rounded-lg p-4 border`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-medium ${textColor} flex items-center space-x-2`}>
          {icon}
          <span>{title}</span>
        </h3>
        <button
          onClick={() => copyToClipboard(content, field)}
          className={`p-1 rounded hover:bg-white/20 transition-colors ${textColor}`}
          title="Copy to clipboard"
        >
          {copiedField === field ? (
            <span className="text-xs">Copied!</span>
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className={`${textColor} text-sm leading-relaxed`}>
        {content}
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
          Processing Results
        </h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Globe className="w-4 h-4" />
            <span>{result.detectedLanguage}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{result.processingTime}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ResultCard
          title="Original Query"
          content={result.originalText}
          icon={<MessageSquare className="w-4 h-4" />}
          bgColor="bg-blue-50 border-blue-200"
          textColor="text-blue-800"
          field="original"
        />

        <ResultCard
          title="English Translation"
          content={result.translatedQuery}
          icon={<Languages className="w-4 h-4" />}
          bgColor="bg-purple-50 border-purple-200"
          textColor="text-purple-800"
          field="translated"
        />

        <ResultCard
          title="AI Response (English)"
          content={result.llmResponse}
          icon={<Bot className="w-4 h-4" />}
          bgColor="bg-orange-50 border-orange-200"
          textColor="text-orange-800"
          field="llm"
        />

        <ResultCard
          title="Final Response"
          content={result.finalResponse}
          icon={<Volume2 className="w-4 h-4" />}
          bgColor="bg-green-50 border-green-200"
          textColor="text-green-800"
          field="final"
        />
      </div>

      <div className="mt-6 flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
          <Volume2 className="w-4 h-4" />
          <span>Play Audio Response</span>
        </button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> This is a demonstration with simulated results. 
          In the actual implementation, this would connect to your Python pipeline 
          and process real audio files through the ElevenLabs, Sarvam, and Groq APIs.
        </p>
      </div>
    </div>
  );
};