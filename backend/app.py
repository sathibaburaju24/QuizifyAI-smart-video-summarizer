from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import tempfile
import shutil
from urllib.parse import urlparse, parse_qs
import whisper
import yt_dlp
from transformers import pipeline
import random
import torch

app = Flask(__name__)
CORS(app)

# Initialize AI models (lazy loading)
summarizer = None
whisper_model = None

# Create temp directory for audio files
TEMP_DIR = tempfile.mkdtemp()

def get_video_id(url):
    """Extract video ID from YouTube URL"""
    try:
        parsed_url = urlparse(url)
        if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
            if parsed_url.path == '/watch':
                return parse_qs(parsed_url.query)['v'][0]
        elif parsed_url.hostname == 'youtu.be':
            return parsed_url.path[1:]
        return None
    except:
        return None

def download_audio(video_url, video_id):
    """Download audio from YouTube video using yt-dlp"""
    try:
        output_path = os.path.join(TEMP_DIR, f"{video_id}.mp3")
        
        # Configure yt-dlp options
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(TEMP_DIR, f"{video_id}.%(ext)s"),
            'quiet': True,
            'no_warnings': True,
        }
        
        print(f"Downloading audio from: {video_url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])
        
        # Check if file exists
        if os.path.exists(output_path):
            print(f"Audio downloaded successfully: {output_path}")
            return output_path
        else:
            print(f"Audio file not found at: {output_path}")
            return None
            
    except Exception as e:
        print(f"Error downloading audio: {str(e)}")
        return None

def transcribe_audio(audio_path):
    """Transcribe audio using Whisper AI (supports any language, outputs English)"""
    global whisper_model
    
    try:
        if whisper_model is None:
            print("Loading Whisper model (this may take a moment on first run)...")
            # Use 'base' model for good balance of speed and accuracy
            # Options: tiny, base, small, medium, large
            whisper_model = whisper.load_model("base")
            print("Whisper model loaded successfully!")
        
        print("Transcribing audio with Whisper AI...")
        # task='translate' will translate any language to English
        result = whisper_model.transcribe(
            audio_path, 
            task='translate',  # Translate to English
            language=None,     # Auto-detect language
            fp16=False         # Use FP32 for CPU compatibility
        )
        
        transcript = result['text']
        detected_language = result.get('language', 'unknown')
        
        print(f"Transcription complete! Detected language: {detected_language}")
        print(f"Transcript length: {len(transcript)} characters")
        
        return transcript, detected_language
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        return None, None

def chunk_text(text, max_length=1024):
    """Split text into chunks for processing"""
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        current_length += len(word) + 1
        if current_length > max_length:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_length = len(word)
        else:
            current_chunk.append(word)
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def generate_summary(text):
    """Generate summary using transformer model"""
    global summarizer
    
    try:
        if summarizer is None:
            print("Loading summarization model...")
            summarizer = pipeline('summarization', model='facebook/bart-large-cnn', device=-1)
        
        # Handle long texts by chunking
        chunks = chunk_text(text, max_length=1024)
        summaries = []
        
        for chunk in chunks:
            if len(chunk.split()) < 50:  # Skip very short chunks
                continue
            
            summary = summarizer(chunk, 
                               max_length=150, 
                               min_length=40, 
                               do_sample=False)
            summaries.append(summary[0]['summary_text'])
        
        # Combine chunk summaries
        final_text = ' '.join(summaries)
        
        # If we have multiple summaries, summarize them again
        if len(summaries) > 1 and len(final_text.split()) > 50:
            final_summary = summarizer(final_text, 
                                      max_length=200, 
                                      min_length=50, 
                                      do_sample=False)
            return final_summary[0]['summary_text']
        
        return final_text
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return None

def generate_quiz(transcript, num_questions=5):
    """Generate quiz questions from transcript"""
    sentences = [s.strip() for s in transcript.split('.') if len(s.strip()) > 20]
    
    if len(sentences) < num_questions:
        num_questions = max(1, len(sentences))
    
    # Select diverse sentences
    selected_sentences = random.sample(sentences, min(num_questions, len(sentences)))
    
    quiz = []
    for sentence in selected_sentences:
        words = sentence.split()
        if len(words) < 5:
            continue
        
        # Find significant words (nouns, verbs, adjectives)
        significant_words = [w for w in words if len(w) > 4 and w.isalpha()]
        
        if not significant_words:
            continue
        
        blank_word = random.choice(significant_words)
        question_text = sentence.replace(blank_word, "______", 1)
        
        # Generate options
        options = [blank_word]
        
        # Add distractors from transcript
        all_words = list(set([w for w in transcript.split() if len(w) > 4 and w.isalpha() and w != blank_word]))
        if len(all_words) >= 3:
            distractors = random.sample(all_words, 3)
            options.extend(distractors)
        else:
            # If not enough words, add generic distractors
            options.extend(['information', 'process', 'system'][:3])
        
        random.shuffle(options)
        correct_index = options.index(blank_word)
        
        quiz.append({
            'q': f"Complete the sentence: {question_text}",
            'options': options[:4],  # Ensure exactly 4 options
            'correct': correct_index
        })
    
    return quiz[:num_questions]

def cleanup_temp_files(video_id):
    """Clean up temporary audio files"""
    try:
        audio_file = os.path.join(TEMP_DIR, f"{video_id}.mp3")
        if os.path.exists(audio_file):
            os.remove(audio_file)
            print(f"Cleaned up: {audio_file}")
    except Exception as e:
        print(f"Error cleaning up files: {str(e)}")

@app.route('/api/process-video', methods=['POST'])
def process_video():
    """Main endpoint to process YouTube video"""
    video_id = None
    
    try:
        data = request.json
        video_url = data.get('url')
        
        if not video_url:
            return jsonify({'error': 'No URL provided'}), 400
        
        # Extract video ID
        video_id = get_video_id(video_url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        print(f"\n{'='*50}")
        print(f"Processing video: {video_id}")
        print(f"{'='*50}\n")
        
        # Step 1: Download audio
        audio_path = download_audio(video_url, video_id)
        if not audio_path:
            return jsonify({'error': 'Failed to download video audio'}), 400
        
        # Step 2: Transcribe audio with Whisper (any language → English)
        transcript, detected_language = transcribe_audio(audio_path)
        if not transcript:
            cleanup_temp_files(video_id)
            return jsonify({'error': 'Failed to transcribe audio'}), 400
        
        # Step 3: Generate summary
        print("Generating AI summary...")
        summary = generate_summary(transcript)
        if not summary:
            cleanup_temp_files(video_id)
            return jsonify({'error': 'Could not generate summary'}), 500
        
        # Step 4: Generate quiz
        print("Generating quiz questions...")
        quiz = generate_quiz(transcript, num_questions=5)
        
        # Cleanup
        cleanup_temp_files(video_id)
        
        print(f"\n{'='*50}")
        print("Processing complete!")
        print(f"{'='*50}\n")
        
        return jsonify({
            'success': True,
            'transcript': transcript[:500] + '...' if len(transcript) > 500 else transcript,
            'summary': summary,
            'quiz': quiz,
            'detected_language': detected_language,
            'video_id': video_id
        })
    
    except Exception as e:
        print(f"Error processing video: {str(e)}")
        if video_id:
            cleanup_temp_files(video_id)
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'whisper_loaded': whisper_model is not None})

if __name__ == '__main__':
    print("="*60)
    print("QuizifyAI Backend Server with Whisper AI")
    print("="*60)
    print("Features:")
    print("  ✓ Works with videos WITHOUT captions")
    print("  ✓ Supports ANY language (auto-detected)")
    print("  ✓ Outputs everything in English")
    print("  ✓ AI-powered summarization")
    print("  ✓ Automatic quiz generation")
    print("="*60)
    print(f"Server running on: http://localhost:5000")
    print("="*60)
    
    try:
        app.run(debug=True, port=5000, use_reloader=False)
    finally:
        # Cleanup temp directory on shutdown
        if os.path.exists(TEMP_DIR):
            shutil.rmtree(TEMP_DIR)
            print("Cleaned up temporary files")
