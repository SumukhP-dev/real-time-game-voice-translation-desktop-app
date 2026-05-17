# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Install WASAPI loopback (For System Audio)
1. Download: https://
2. Install and **restart your computer**
3. Set "your output device" as default playback device in Windows

### Step 3: Run the App
```bash
python main_tkinter.py
```

### Step 4: Configure
1. Click **"Check System Audio"** to verify setup
2. Select **"your output device"** from audio device dropdown
3. Enable **"Text Overlay"** (for subtitles)
4. Click **"Start Translation"**

### Step 5: Test
- Play a YouTube video with speech
- Or start your game (CS:GO 2, Valorant, Apex Legends, Dota 2, or any competitive multiplayer game)
- You should see transcriptions and translations appear!

## Troubleshooting

**No audio captured?**
- Click "Check System Audio" button
- Make sure WASAPI loopback is installed
- Verify "your output device" is selected in the app
- Check that audio is actually playing

**Getting errors?**
- See `AUDIO_DEVICE_GUIDE.md` for detailed setup
- See `README.md` for full documentation

## What Each Button Does

- **"Select Stereo Mix"**: Auto-selects Stereo Mix (if available)
- **"Check System Audio"**: Diagnoses your audio setup and provides guidance
- **"Start Translation"**: Begins capturing and translating audio
- **"Stop Translation"**: Stops the service

## Need Help?

- **System Audio Setup**: See `AUDIO_DEVICE_GUIDE.md`
- **Full Documentation**: See `README.md`
- **Troubleshooting**: See `SOLUTIONS.md`
