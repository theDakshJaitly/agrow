# AI Helpline Frontend

A React frontend for the AI-Powered Helpline Data Pipeline for Indian Farmers.

## Setup Instructions

### Prerequisites
1. Make sure your Python pipeline is set up with all required API keys in a `.env` file
2. Install Python dependencies: `pip install -r ai-helpline-pipeline/requirements.txt`
3. Node.js and npm installed

### Running the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start both frontend and backend:**
   ```bash
   npm run dev:full
   ```
   
   This will start:
   - Express server on `http://localhost:3001` (API backend)
   - Vite dev server on `http://localhost:5173` (React frontend)

3. **Or run separately:**
   ```bash
   # Terminal 1 - Start the API server
   npm run server
   
   # Terminal 2 - Start the frontend
   npm run dev
   ```

### Environment Setup

Make sure your `ai-helpline-pipeline/.env` file contains:
```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### How It Works

1. **Upload Audio**: Drag and drop or select an audio file in any supported Indian language
2. **Processing**: The file is sent to the Express server, which calls your Python pipeline
3. **Pipeline Execution**: Your pipeline processes the audio through:
   - Speech-to-Text (ElevenLabs)
   - Translation (Sarvam AI)
   - LLM Processing (Groq)
   - Back Translation (Sarvam AI)
   - Text-to-Speech (ElevenLabs)
4. **Results**: The frontend displays the processing steps and final audio response

### API Endpoints

- `POST /api/process-audio` - Upload and process audio file
- `GET /api/status/:processingId` - Check processing status
- `GET /api/logs` - Get pipeline logs
- `GET /api/health` - Health check

### Troubleshooting

- Check that all API keys are properly set in your `.env` file
- Ensure Python dependencies are installed
- Check server logs for detailed error information
- Make sure ports 3001 and 5173 are available