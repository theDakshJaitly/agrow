import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { spawn } from 'node:child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Store active processing sessions
const activeSessions = new Map();
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/output', express.static(path.join(__dirname, 'ai-helpline-pipeline', 'output')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Process audio endpoint
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
}
)
// Custom middleware to handle multer errors
const handleUpload = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'File too large', 
          message: 'Audio file must be smaller than 50MB' 
        });
      }
      return res.status(400).json({ 
        error: 'Upload error', 
        message: err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        error: 'Invalid file', 
        message: err.message 
      });
    }
    next();
  });
};

app.post('/api/process-audio', handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { sourceLanguage = 'auto', targetLanguage = 'en' } = req.body;
    const audioPath = req.file.path;
    const outputFileName = `response-${Date.now()}.wav`;
    const processingId = path.basename(audioPath, path.extname(audioPath));
    
    console.log(`Processing audio file: ${audioPath}`);
    console.log(`Source language: ${sourceLanguage}, Target language: ${targetLanguage}`);

    // Initialize session tracking
    activeSessions.set(processingId, {
      status: 'processing',
      currentStep: 'stt',
      steps: {
        stt: { status: 'processing', data: null },
        translation: { status: 'pending', data: null },
        llm: { status: 'pending', data: null },
        'back-translation': { status: 'pending', data: null },
        tts: { status: 'pending', data: null }
      },
      result: null,
      error: null
    });

    // Send initial response to start the pipeline visualization
    res.json({
      status: 'processing',
      message: 'Audio processing started',
      processingId: processingId
    });

    // Run the Python pipeline in the background
    const pythonProcess = spawn('python', [
      '-m', 'ai_helpline_pipeline.main',
      audioPath,
      '--output', outputFileName,
      '--source-lang', sourceLanguage,
      '--target-lang', targetLanguage,
      '--verbose'
    ], {
      cwd: path.join(__dirname, 'ai-helpline-pipeline'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let transcribedText = '';
    let translatedQuery = '';
    let llmResponse = '';
    let finalResponse = '';
    let detectedLanguage = sourceLanguage;

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      const output = data.toString();
      console.log('Python stdout:', data.toString());
      
      // Parse pipeline progress from logs
      const session = activeSessions.get(processingId);
      if (session) {
        if (output.includes('Step 1: Converting speech to text')) {
          session.currentStep = 'stt';
          session.steps.stt.status = 'processing';
        } else if (output.includes('Transcribed text:')) {
          const match = output.match(/Transcribed text: (.+)/);
          if (match) {
            transcribedText = match[1].trim();
            session.steps.stt.status = 'completed';
            session.steps.stt.data = transcribedText;
            session.currentStep = 'translation';
            session.steps.translation.status = 'processing';
          }
        } else if (output.includes('Step 2: Translating query to')) {
          session.currentStep = 'translation';
          session.steps.translation.status = 'processing';
        } else if (output.includes('Translated query:')) {
          const match = output.match(/Translated query: (.+)/);
          if (match) {
            translatedQuery = match[1].trim();
            session.steps.translation.status = 'completed';
            session.steps.translation.data = translatedQuery;
          }
        } else if (output.includes('Step 3: Processing query with LLM')) {
          session.currentStep = 'llm';
          session.steps.llm.status = 'processing';
        } else if (output.includes('LLM response:')) {
          const match = output.match(/LLM response: (.+)/);
          if (match) {
            llmResponse = match[1].trim();
            session.steps.llm.status = 'completed';
            session.steps.llm.data = llmResponse;
            session.currentStep = 'back-translation';
            session.steps['back-translation'].status = 'processing';
          }
        } else if (output.includes('Step 4: Translating response back')) {
          session.currentStep = 'back-translation';
          session.steps['back-translation'].status = 'processing';
        } else if (output.includes('Final translated response:')) {
          const match = output.match(/Final translated response: (.+)/);
          if (match) {
            finalResponse = match[1].trim();
            session.steps['back-translation'].status = 'completed';
            session.steps['back-translation'].data = finalResponse;
          }
        } else if (output.includes('Step 5: Converting text to speech')) {
          session.currentStep = 'tts';
          session.steps.tts.status = 'processing';
        } else if (output.includes('skipping translation to English')) {
          session.steps.translation.status = 'skipped';
          session.currentStep = 'llm';
          session.steps.llm.status = 'processing';
          translatedQuery = transcribedText; // Use original text as translated query
        } else if (output.includes('Audio file created:')) {
          session.steps.tts.status = 'completed';
          session.currentStep = 'completed';
          session.status = 'completed';
        }
        
        activeSessions.set(processingId, session);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      const session = activeSessions.get(processingId);
      
      // Clean up uploaded file
      fs.unlink(audioPath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      if (code === 0) {
        console.log('Pipeline completed successfully');
        if (session) {
          session.status = 'completed';
          session.currentStep = 'completed';
          session.result = {
            originalText: transcribedText,
            translatedQuery: translatedQuery || transcribedText,
            llmResponse: llmResponse,
            finalResponse: finalResponse || llmResponse,
            detectedLanguage: detectedLanguage,
            processingTime: 'Processing completed',
            audioUrl: `/output/${outputFileName}`
          };
          activeSessions.set(processingId, session);
        }
      } else {
        console.error(`Pipeline failed with code ${code}`);
        console.error('stderr:', stderr);
        if (session) {
          session.status = 'error';
          session.error = stderr || 'Pipeline processing failed';
          activeSessions.set(processingId, session);
        }
      }
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Get processing status endpoint (for real-time updates)
app.get('/api/status/:processingId', (req, res) => {
  const { processingId } = req.params;
  
  const session = activeSessions.get(processingId);
  
  if (session) {
    res.json(session);
  } else {
    res.json({
      status: 'not_found',
      error: 'Processing session not found'
    });
  }
});

// Get pipeline logs endpoint
app.get('/api/logs', (req, res) => {
  try {
    const logPath = path.join(__dirname, 'ai-helpline-pipeline', 'logs', 'pipeline.log');
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, 'utf8');
      const recentLogs = logs.split('\n').slice(-50).join('\n'); // Last 50 lines
      res.json({ logs: recentLogs });
    } else {
      res.json({ logs: 'No logs available' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error reading logs' });
  }
});

// Clean up completed sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    // Remove sessions older than 1 hour
    if (session.status === 'completed' || session.status === 'error') {
      if (now - session.timestamp > 3600000) { // 1 hour
        activeSessions.delete(id);
      }
    }
  }
}, 300000); // Clean up every 5 minutes

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Make sure your Python pipeline is set up with proper environment variables');
});