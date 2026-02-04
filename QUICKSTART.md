# 🚀 Quick Start Guide

Get QuizifyAI running in 3 simple steps!

## Step 1: Install FFmpeg ⚡

**Windows (with Chocolatey - Recommended):**
```bash
choco install ffmpeg
```

**Verify:**
```bash
ffmpeg -version
```

**Don't have Chocolatey?** See [FFMPEG_INSTALL.md](FFMPEG_INSTALL.md) for other methods.

---

## Step 2: Start Backend Server 🖥️

**Option A: Double-click**
- Double-click `start_backend.bat`

**Option B: Command line**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Wait for:**
```
Server running on: http://localhost:5000
```

---

## Step 3: Start Frontend Server 🌐

**Option A: Double-click**
- Double-click `start_frontend.bat`

**Option B: Command line**
```bash
python -m http.server 8000
```

**Then open browser:**
```
http://localhost:8000
```

---

## 🎬 Try It Out!

1. Paste a YouTube URL (any language!)
2. Click "Generate"
3. Wait for processing (1-3 minutes)
4. View summary or take quiz!

### Example Videos:
- English: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Spanish: Any "Como hacer..." tutorial
- Any language: The system auto-detects!

---

## ⚠️ First Run Notes

- First run downloads AI models (~2GB)
- Takes 5-10 minutes initially
- Subsequent runs are much faster!
- Models are cached permanently

---

## 🆘 Need Help?

- **FFmpeg issues**: See [FFMPEG_INSTALL.md](FFMPEG_INSTALL.md)
- **Full documentation**: See [README.md](README.md)
- **Upgrade details**: See [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md)

---

## ✅ System Check

Before running, verify:
- [ ] FFmpeg installed (`ffmpeg -version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] 4GB+ RAM available
- [ ] 5GB+ disk space free
- [ ] Internet connection active

---

**That's it! Enjoy QuizifyAI! 🎉**
