# FFmpeg Installation Guide for Windows

FFmpeg is required for audio extraction and processing. Follow these steps to install it:

## Method 1: Using Chocolatey (Recommended - Easiest)

1. **Install Chocolatey** (if not already installed):
   - Open PowerShell as Administrator
   - Run:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install FFmpeg**:
   ```powershell
   choco install ffmpeg
   ```

3. **Verify Installation**:
   ```powershell
   ffmpeg -version
   ```

## Method 2: Manual Installation

1. **Download FFmpeg**:
   - Go to: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip`

2. **Extract Files**:
   - Extract to: `C:\ffmpeg`
   - You should have: `C:\ffmpeg\bin\ffmpeg.exe`

3. **Add to PATH**:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `C:\ffmpeg\bin`
   - Click OK on all windows

4. **Verify Installation**:
   - Open new Command Prompt
   - Run: `ffmpeg -version`

## Method 3: Using Scoop

1. **Install Scoop** (if not already installed):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Install FFmpeg**:
   ```powershell
   scoop install ffmpeg
   ```

3. **Verify Installation**:
   ```powershell
   ffmpeg -version
   ```

## Troubleshooting

### "ffmpeg is not recognized as an internal or external command"
- Make sure FFmpeg is added to your PATH
- Restart your terminal/command prompt after installation
- Restart your computer if needed

### Permission Issues
- Run Command Prompt or PowerShell as Administrator
- Make sure you have write permissions to the installation directory

## After Installation

Once FFmpeg is installed, you can proceed with running the QuizifyAI backend:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Verification

To verify everything is working:

1. Open Command Prompt
2. Run: `ffmpeg -version`
3. You should see FFmpeg version information

If you see the version info, you're all set! 🎉
