# Quick Setup Guide

## Required Settings to Configure

### 1. **Audio Settings** (CRITICAL - Must Configure First)
   - **Audio Device**: Select your audio input device
     - **For CS:GO 2 game audio**: Use **"CABLE Output (VB-Audio Virtual Cable)"**
     - **For microphone**: Use your headset/microphone device
   - **Start Capture**: Click "Start Capture" to begin audio capture
   - Status should show: "Capturing audio..."

### 2. **Translation Settings** (Required)
   - **Target Language**: Select the language you want translations TO
     - Example: If teammates speak Spanish and you want English, select "English"
   - **Enable Text Overlay**: ✅ Check this to show subtitles on screen
   - **Show Subtitles for Same Language**: 
     - ✅ Check if you want to see subtitles even when source = target language
     - ❌ Uncheck if you only want subtitles when languages differ

### 3. **Optional Settings**
   - **Enable Audio Playback (TTS)**: Check if you want translated text read aloud
   - **Discord Integration**: Configure if you want Discord status updates
   - **OBS Integration**: Configure if streaming with OBS

## Step-by-Step Setup

1. **Start Audio Capture**
   - Go to "Audio Settings"
   - Select "CABLE Output (VB-Audio Virtual Cable)" from dropdown
   - Click "Start Capture"
   - Verify status shows "Capturing audio..."

2. **Configure Translation**
   - Go to "Translation Settings"
   - Select your target language (e.g., "English")
   - ✅ Check "Enable Text Overlay"
   - ✅ Check "Show Subtitles for Same Language" (optional)

3. **Test the Setup**
   - Play some audio or speak into your microphone
   - Watch the "Status" bar at the top - it should show:
     - "Receiving audio... (X chunks, Y quiet)"
     - "Processing audio..." when speech is detected
     - "Transcribed: [text]" when transcription succeeds
     - "Translated: [text]" when translation succeeds
   - Check the "Translation Log" panel for translation history

4. **Verify Subtitles**
   - A separate overlay window should appear showing translated text
   - If subtitles don't appear, check:
     - ✅ "Enable Text Overlay" is checked
     - Audio is being captured (status shows chunks)
     - Speech is being detected (status shows "Transcribed")

## Troubleshooting

### No Audio Being Captured
- Verify the correct audio device is selected
- Check Windows Sound Settings - ensure the device is set as default input
- For game audio: Ensure VB-Audio Virtual Cable is set as your game's output device

### No Transcriptions
- Check console (F12) for error messages
- Verify ML service is running (should be on port 8000)
- Ensure audio level is above threshold (status shows "0 quiet" means audio is detected)

### No Subtitles Showing
- Verify "Enable Text Overlay" is checked
- Check if translation is happening (see Translation Log)
- Verify overlay window isn't hidden behind other windows
- Check console (F12) for overlay-related errors

### Translations Not Working
- Verify ML service is running
- Check target language is set correctly
- Look for errors in console (F12)
- Check Translation Log for any failed translations

## Audio Device Recommendations

- **For CS:GO 2 Game Audio**: 
  - Use "CABLE Output (VB-Audio Virtual Cable)"
  - Set this as your game's audio output in Windows Sound Settings
  
- **For Microphone/Headset**:
  - Use "Headset Microphone" or your specific microphone device
  - Ensure it's set as default recording device in Windows

## Status Messages Explained

- **"Receiving audio... (X chunks, Y quiet)"**: Audio is being captured
  - X = total chunks received
  - Y = chunks that were too quiet (silence)
  
- **"Processing audio..."**: Audio is being sent to transcription service

- **"Transcribed: [text]"**: Speech was successfully transcribed

- **"Translated: [text]"**: Text was successfully translated

- **"No speech detected in audio"**: Audio was processed but no speech found

