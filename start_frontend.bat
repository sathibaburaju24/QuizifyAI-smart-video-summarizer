@echo off
echo ========================================
echo QuizifyAI - Starting Frontend Server
echo ========================================
echo.
echo Starting HTTP server on http://localhost:8000
echo.
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

pause
