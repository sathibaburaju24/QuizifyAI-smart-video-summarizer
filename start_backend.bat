@echo off
echo ========================================
echo QuizifyAI - Starting Backend Server
echo ========================================
echo.

REM Check if FFmpeg is installed
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] FFmpeg is not installed or not in PATH!
    echo.
    echo Please install FFmpeg first. See FFMPEG_INSTALL.md for instructions.
    echo.
    echo Quick install with Chocolatey:
    echo   choco install ffmpeg
    echo.
    pause
    exit /b 1
)

echo [OK] FFmpeg is installed
echo.

cd backend
echo Installing Python dependencies...
pip install -q flask flask-cors openai-whisper yt-dlp transformers torch sentencepiece protobuf

echo.
echo Starting Flask server on http://localhost:5000
echo.
echo NOTE: First run will download AI models (~2GB). This may take several minutes.
echo.
python app.py

pause

