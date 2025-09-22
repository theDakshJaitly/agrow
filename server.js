import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { sourceLanguage = 'auto', targetLanguage = 'en' } = req.body;
    const audioPath = req.file.path;
    const outputFileName = `response-${Date.now()}.wav`;
    
    console.log(`Processing audio file: ${audioPath}`);
    console.log(`Source language: ${sourceLanguage}, Target language: ${targetLanguage}`);

    // Send initial response to start the pipeline visualization
    res.json({
      status: 'processing',
      message: 'Audio processing started',
      processingId: path.basename(audioPath, path.extname(audioPath))
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

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      // Clean up uploaded file
      fs.unlink(audioPath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });

      if (code === 0) {
        console.log('Pipeline completed successfully');
      } else {
        console.error(`Pipeline failed with code ${code}`);
        console.error('stderr:', stderr);
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
  
  // Check if output file exists
  const outputPath = path.join(__dirname, 'ai-helpline-pipeline', 'output');
  const files = fs.readdirSync(outputPath).filter(f => f.includes(processingId));
  
  if (files.length > 0) {
    res.json({
      status: 'completed',
      outputFile: `/output/${files[0]}`
    });
  } else {
    res.json({
      status: 'processing'
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

app.get('/api/stream-logs/:processingId', (req, res) => {
  const { processingId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const logPath = path.join(__dirname, 'ai-helpline-pipeline', 'logs', 'pipeline.log');
  let filePos = 0;

  // Send new log lines as they are written
  const interval = setInterval(() => {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > filePos) {
        const stream = fs.createReadStream(logPath, { start: filePos, end: stats.size });
        const rl = readline.createInterface({ input: stream });
        rl.on('line', (line) => {
          if (line.includes(processingId)) { // Filter by processingId if you tag logs
            res.write(`data: ${line}\n\n`);
          }
        });
        rl.on('close', () => {
          filePos = stats.size;
        });
      }
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

const evtSource = new EventSource(`/api/stream-logs/${processingId}`);
evtSource.onmessage = (event) => {
  // Append event.data to your log display
};

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Make sure your Python pipeline is set up with proper environment variables');
});