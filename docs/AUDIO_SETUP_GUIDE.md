# Audio Setup Guide - Capturing Computer Audio

## The Problem
If you selected your **microphone** (headphone mic), it will only capture what your microphone picks up, NOT the computer audio (YouTube, games, etc.).

## The Solution
You need to select **"Stereo Mix"** to capture system/computer audio.

## Step-by-Step Instructions

### 1. Enable Stereo Mix in Windows (if not already enabled)

1. **Right-click** the speaker icon in your system tray (bottom-right)
2. Select **"Sounds"** or **"Sound settings"**
3. Go to the **"Recording"** tab
4. **Right-click** in the empty space in the device list
5. Select **"Show Disabled Devices"**
6. Find **"Stereo Mix"** in the list
7. **Right-click** on "Stereo Mix" → **"Enable"**
8. (Optional) Right-click → **"Set as Default Device"**

### 2. Select Stereo Mix in the Application

1. Open the translation app
2. In the **"Audio Device"** dropdown, look for:
   - **"Stereo Mix (Realtek HD Audio Stereo input)"** or similar
3. **Select "Stereo Mix"** from the dropdown
4. Click **"Start Translation"**

### 3. Verify It's Working

- Play a YouTube video with speech
- You should see transcriptions appearing in the log
- The app will translate any non-English speech

## Device Selection Guide

| Device Type | What It Captures | When to Use |
|------------|------------------|-------------|
| **Stereo Mix** | All computer audio (YouTube, games, music, etc.) | For translating videos, games, system audio |
| **Microphone** | Only what your mic picks up | For translating your own speech or nearby conversations |
| **Headset Mic** | Only what your headset mic picks up | Same as microphone |

## Troubleshooting

### "Stereo Mix" not in the dropdown?
- Make sure you enabled it in Windows Sound settings (see step 1 above)
- Some audio drivers don't support Stereo Mix
- **Alternative**: Install VB-Audio Virtual Cable (free)

### Still not capturing audio?
- Make sure audio is actually playing (check volume)
- Try selecting a different audio device
- Check the Translation Log for error messages
- Restart the application after enabling Stereo Mix

### Getting microphone instead of system audio?
- **You MUST select "Stereo Mix"** - not your microphone!
- The app will now auto-select Stereo Mix if available
- Check the log messages to see which device is selected

## Quick Test

1. Select "Stereo Mix" in the app
2. Start translation
3. Play a YouTube video with speech
4. Check the Translation Log - you should see transcriptions

If you see transcriptions, it's working! 🎉

