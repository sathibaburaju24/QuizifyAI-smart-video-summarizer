@echo off
echo ========================================
echo QuizifyAI - GitHub Push Script
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [OK] Git is installed
echo.

REM Initialize git repository
echo Step 1: Initializing Git repository...
git init
echo.

REM Add all files
echo Step 2: Adding all files to Git...
git add .
echo.

REM Commit
echo Step 3: Creating initial commit...
git commit -m "Initial commit: QuizifyAI - Smart Video Summarizer with Whisper AI and BART"
echo.

echo ========================================
echo Git repository initialized successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub (https://github.com/new)
echo 2. Copy the repository URL
echo 3. Run the following commands:
echo.
echo    git branch -M main
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git push -u origin main
echo.
echo Replace YOUR_GITHUB_REPO_URL with your actual GitHub repository URL
echo Example: https://github.com/yourusername/quizifyai.git
echo.
pause
