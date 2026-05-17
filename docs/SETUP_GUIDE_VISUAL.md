# Visual Setup Guide

Step-by-step setup for the Real-Time Game Voice Translation app on Windows.

## Prerequisites

- Windows 10 or Windows 11 (64-bit)
- Headphones or speakers connected
- ML service running (started automatically with the Electron app)

## Step 1: Audio capture (WASAPI loopback)

No virtual audio cable installation is required.

1. Launch the application
2. Open **Audio Settings**
3. In the device dropdown, choose your **headphones or speakers** — the name should include **(WASAPI loopback)**
4. Click **Start Capture**
5. Play game voice chat or any audio source
6. Confirm the status log shows non-zero **RMS** levels

## Step 2: Translation and subtitles

1. Set your **target language** in Translation Settings
2. Enable **Text Overlay** if you want on-screen subtitles
3. Click **Test Overlay** to verify subtitles appear
4. Speak or play audio with speech; translations should appear in the log and overlay

## Step 3: Optional — Stereo Mix fallback

If no WASAPI loopback device appears:

1. Windows Sound → **Recording** → right-click empty area → **Show disabled devices**
2. Enable **Stereo Mix**
3. Select **Stereo Mix** in the app Audio Settings

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| RMS=0 | Correct loopback device selected; volume up; capture started |
| No subtitles | Overlay enabled; ML service healthy; different source/target language |
| No devices listed | Restart app; confirm ML service on port 8000 |

See `AUDIO_DEVICE_GUIDE.md` and `AUDIO_SETUP_GUIDE.md` for more detail.
