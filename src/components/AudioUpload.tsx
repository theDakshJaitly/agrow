import React, { useRef, useState } from 'react';
import { Upload, Mic, RotateCcw, Play, Bot } from 'lucide-react';

interface AudioUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
  onReset: () => void;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({ onUpload, isProcessing, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid audio file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    onReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Mic className="w-5 h-5 mr-2 text-green-600" />
        Upload Audio Query
      </h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Play className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Process Audio</span>
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your audio file here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse (WAV, MP3, M4A supported)
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Choose File
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Supported Languages:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700">
          <span>• Hindi (हिंदी)</span>
          <span>• Punjabi (ਪੰਜਾਬੀ)</span>
          <span>• Tamil (தமிழ்)</span>
          <span>• Telugu (తెలుగు)</span>
          <span>• Bengali (বাংলা)</span>
          <span>• Gujarati (ગુજરાતી)</span>
          <span>• Marathi (मराठी)</span>
          <span>• Kannada (ಕನ್ನಡ)</span>
          <span>• Malayalam (മലയാളം)</span>
          <span>• Odia (ଓଡ଼ିଆ)</span>
          <span>• Assamese (অসমীয়া)</span>
          <span>• Urdu (اردو)</span>
        </div>
      </div>
    </div>
  );
};