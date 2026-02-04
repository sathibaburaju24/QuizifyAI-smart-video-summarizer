# QuizifyAI: Smart Video Summarizer and Quiz Generator

Transform YouTube videos into knowledge with AI-powered summaries and interactive quizzes!

## 🌟 Key Features

- **🎯 Works WITHOUT Captions**: Uses Whisper AI to transcribe audio directly from videos
- **🌍 Multi-Language Support**: Automatically detects and transcribes videos in ANY language
- **🇬🇧 English Output**: All summaries and quizzes are generated in English, regardless of source language
- **🤖 AI-Powered Summarization**: Uses BART transformer model to generate concise summaries
- **📝 Automatic Quiz Generation**: Creates contextual quiz questions from video content
- **🔊 Audio Playback**: Listen to summaries with text-to-speech
- **✨ Beautiful UI**: Modern, responsive design with smooth animations

## Architecture

### Frontend (HTML/CSS/JavaScript)
- Clean, modern interface
- Real-time processing feedback
- Interactive quiz interface
- Audio player for summaries

### Backend (Python/Flask)
- YouTube video audio extraction (yt-dlp)
- Whisper AI for speech-to-text (any language → English)
- BART transformer for summarization
- Intelligent quiz generation
- RESTful API

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- **FFmpeg** (required for audio processing)
- Modern web browser

### Step 1: Install FFmpeg

**IMPORTANT**: FFmpeg must be installed before running the backend.

See detailed instructions in: **[FFMPEG_INSTALL.md](FFMPEG_INSTALL.md)**

**Quick Install (Windows with Chocolatey)**:
```bash
choco install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### Step 2: Install Python Dependencies
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

   **Note**: First installation may take 5-10 minutes as it downloads:
   - Whisper AI models (~150MB)
   - BART model (~1.6GB)
   - PyTorch and other dependencies

### Step 3: Start the Backend Server
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

3. **Start the Frontend Server**
   Open a new terminal in the project root:
   ```bash
   python -m http.server 8000
   ```
   The frontend will run on `http://localhost:8000`

4. **Access the Application**
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Usage

1. **Enter a YouTube URL**: Paste ANY YouTube video link
   - ✅ Works with videos that have captions
   - ✅ Works with videos WITHOUT captions
   - ✅ Supports ANY language (Spanish, French, Hindi, Japanese, etc.)
   
2. **Click Generate**: The system will:
   - Download the video audio
   - Transcribe using Whisper AI (auto-detects language)
   - Translate to English if needed
   - Generate an AI summary in English
   - Create quiz questions in English
   
3. **View Summary**: Read or listen to the AI-generated summary
4. **Take Quiz**: Test your knowledge with automatically generated questions

## Example YouTube Videos to Try

Try videos in different languages:
- **English**: Educational videos, TED Talks, tutorials
- **Spanish**: "Como hacer..." tutorials
- **French**: French documentaries
- **Hindi**: Bollywood movie explanations
- **Japanese**: Anime explanations
- **Any other language**: The system auto-detects and translates!

**No captions needed!** The system extracts audio and transcribes it automatically.

## Technology Stack

### Frontend
- HTML5
- CSS3 (with modern features like glassmorphism)
- Vanilla JavaScript
- Font Awesome icons
- Google Fonts (Inter)

### Backend
- Flask (Python web framework)
- **OpenAI Whisper** (multilingual speech recognition)
- **yt-dlp** (YouTube video/audio downloader)
- **FFmpeg** (audio processing)
- Transformers (Hugging Face)
- BART model (facebook/bart-large-cnn)
- PyTorch

## API Endpoints

### POST `/api/process-video`
Process a YouTube video and generate summary + quiz

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "Full transcript...",
  "summary": "AI-generated summary...",
  "quiz": [
    {
      "q": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct": 1
    }
  ]
}
```

### GET `/api/health`
Health check endpoint

## Troubleshooting

### FFmpeg Issues
- **Error: FFmpeg not found**
  - Install FFmpeg following [FFMPEG_INSTALL.md](FFMPEG_INSTALL.md)
  - Make sure FFmpeg is in your system PATH
  - Restart your terminal after installation

### Backend Server Issues
- **Error: Cannot connect to backend server**
  - Make sure the backend is running on port 5000
  - Check if Python dependencies are installed
  - Verify no firewall is blocking port 5000

### Video Processing Issues
- **Error: Failed to download video audio**
  - Check your internet connection
  - Some videos may be age-restricted or region-locked
  - Try a different video
  
- **Processing takes a long time**
  - First run downloads Whisper model (~150MB) and BART model (~1.6GB)
  - Longer videos take more time to process
  - Whisper transcription can take 1-3 minutes for a 10-minute video

### Model Loading Issues
- **First run takes time**: Models download automatically on first use
- **Memory issues**: Ensure you have at least 4GB RAM available
- **Disk space**: Ensure at least 5GB free space for models

## Future Enhancements

- Support for video upload (not just YouTube)
- Multiple language support
- Advanced quiz types (multiple correct answers, true/false)
- Export summaries as PDF
- User accounts and history
- Custom quiz difficulty levels

## License

Educational project for demonstration purposes.

## Credits

Developed as a college project demonstrating Transformer-Based NLP capabilities.
