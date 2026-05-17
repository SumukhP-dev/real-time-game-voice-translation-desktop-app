# Fix: Can't Hear Audio with WASAPI loopback

## Problem
You've set your output device as default, but you can't hear anything through headphones.

## Solution: Fix "Listen to this device"

### Step-by-Step Fix:

1. **Open Windows Sound Settings**
   - Right-click speaker icon → "Sounds"
   - OR: Press `Win + R`, type `mmsys.cpl`, press Enter

2. **Go to Recording Tab**
   - Click the "Recording" tab at the top

3. **Find virtual microphone**
   - Look for "virtual microphone (WASAPI loopback)"
   - If you don't see it, right-click empty space → "Show Disabled Devices"

4. **Open Properties**
   - Right-click "virtual microphone" → "Properties"

5. **Go to Listen Tab**
   - Click the "Listen" tab

6. **Enable Listen to this device**
   - ✅ CHECK the box "Listen to this device"

7. **Select Your Headphones**
   - In the dropdown "Playback through this device"
   - Select your headphones: **"Headset (Bose QC Headphones)"** or your actual headphones
   - Make sure it's NOT "your output device" or "Default Device"

8. **Apply Settings**
   - Click "Apply"
   - Click "OK"

9. **Test**
   - Play a YouTube video
   - You should NOW hear it through your headphones!

## Alternative: WASAPI loopback (recommended)

The Electron app captures game audio directly from your headphones/speakers output via **WASAPI loopback** — you do not need to change Windows default devices or install a virtual cable.

1. Audio Settings → select **(WASAPI loopback)** device
2. Start Capture → play audio → check RMS in status logs

## Quick Check

- Play a YouTube video or game voice chat
- Status logs show non-zero RMS → capture is working

