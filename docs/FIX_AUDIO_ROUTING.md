# Fix: Can't Hear Audio with VB-Audio Virtual Cable

## Problem
You've set CABLE Input as default, but you can't hear anything through headphones.

## Solution: Fix "Listen to this device"

### Step-by-Step Fix:

1. **Open Windows Sound Settings**
   - Right-click speaker icon → "Sounds"
   - OR: Press `Win + R`, type `mmsys.cpl`, press Enter

2. **Go to Recording Tab**
   - Click the "Recording" tab at the top

3. **Find CABLE Output**
   - Look for "CABLE Output (VB-Audio Virtual Cable)"
   - If you don't see it, right-click empty space → "Show Disabled Devices"

4. **Open Properties**
   - Right-click "CABLE Output" → "Properties"

5. **Go to Listen Tab**
   - Click the "Listen" tab

6. **Enable Listen to this device**
   - ✅ CHECK the box "Listen to this device"

7. **Select Your Headphones**
   - In the dropdown "Playback through this device"
   - Select your headphones: **"Headset (Bose QC Headphones)"** or your actual headphones
   - Make sure it's NOT "CABLE Input" or "Default Device"

8. **Apply Settings**
   - Click "Apply"
   - Click "OK"

9. **Test**
   - Play a YouTube video
   - You should NOW hear it through your headphones!

## Alternative: Use VoiceMeeter (Easier Solution)

If "Listen to this device" doesn't work, use VoiceMeeter instead:

1. **Download VoiceMeeter** (FREE): https://vb-audio.com/Voicemeeter/
2. **Install and restart**
3. **Setup:**
   - Set VoiceMeeter Input as default playback device
   - Route VoiceMeeter Output to both:
     - Your headphones (for listening)
     - CABLE Input (for capture)
4. **In translation app:** Select CABLE Output

## Quick Check

After enabling "Listen to this device":
- Play a YouTube video
- Do you hear it? ✅ = Working | ❌ = Try VoiceMeeter

