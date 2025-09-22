# AI-Powered Helpline Data Pipeline

An automated backend script that processes audio queries through multiple AI services to provide intelligent helpline responses in multiple languages.

## Project Structure

```
ai-helpline-pipeline/
├── main.py                  # Main entry point (CLI)
├── pipeline.py              # Core pipeline logic
├── config.py                # Configuration settings
├── requirements.txt         # Python dependencies
├── api_clients/
│   ├── __init__.py          # Package initialization
│   ├── elevenlabs_client.py # ElevenLabs API client (STT/TTS)
│   ├── sarvam_client.py     # Sarvam API client (Translation)
│   └── groq_client.py       # Groq API client (LLM)
├── temp/                    # Temporary files
├── logs/                    # Log files
├── output/                  # Output audio files
└── README.md                # Project documentation
```

## Quick Start

1) Installation

```bash
pip install -r requirements.txt
```

2) Configuration (.env)

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SARVAM_API_KEY=your_sarvam_api_key_here
GROQ_API_KEY=your_groq_api_key_here

ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
SARVAM_BASE_URL=https://api.sarvam.ai/v1
GROQ_BASE_URL=https://api.groq.com/openai/v1

GROQ_MODEL_NAME=mixtral-8x7b-32768
MIN_STT_CONFIDENCE=0.7
MIN_TRANSLATION_QUALITY=0.6
```

3) Usage

```bash
python -m ai_helpline_pipeline.main input.wav
python -m ai_helpline_pipeline.main input.wav --output my_response.wav
python -m ai_helpline_pipeline.main input.wav --source-lang hi --target-lang en -v
```

Alternatively, run from the project folder:

```bash
python main.py input.wav --verbose
```

## Pipeline Workflow

1. Speech-to-Text (ElevenLabs)
2. Translation to English (Sarvam) when needed
3. LLM Processing (Groq)
4. Translate response back to the original language (Sarvam) when needed
5. Text-to-Speech (ElevenLabs)

## Supported Languages

hi, en, ta, te, bn, gu, mr, pa, kn, ml, or, as, ur, ne

## Troubleshooting

- Ensure API keys are set via environment variables
- Check `logs/pipeline.log` for detailed logs
- Prefer `.wav` input for best STT quality

## License

MIT
