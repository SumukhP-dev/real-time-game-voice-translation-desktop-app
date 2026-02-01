# Audio Capture Debugging Guide

## Issues Fixed

1. **Added better logging** - Audio capture now logs:
   - Device enumeration (which devices are found)
   - Device selection (which device is being used)
   - Audio configuration (sample rate, channels, format)
   - Stream errors
   - Audio chunk sending errors

2. **Added silence detection** - Audio chunks with very low RMS levels (< 0.001) are filtered out to avoid processing silence

3. **Improved error messages** - More descriptive error messages when devices fail

4. **Frontend logging** - Frontend now logs:
   - When audio chunks are received
   - Audio level detection
   - Processing status

## Common Issues and Solutions

### Issue: No audio devices found
**Solution:**
- Check Windows Sound settings
- Ensure audio drivers are installed
- For game audio capture, install VB-Audio Virtual Cable

### Issue: Audio device not capturing
**Possible causes:**
1. **Wrong device selected** - Make sure you select the correct device:
   - For microphone: Select your microphone
   - For game audio: Select "Stereo Mix" or "CABLE Output (VB-Audio Virtual Cable)"

2. **Device not enabled** - Check Windows Sound settings:
   - Right-click speaker icon → Sounds → Recording tab
   - Enable "Stereo Mix" if using it (right-click → Enable)
   - For VB-Audio Cable, ensure it's installed and enabled

3. **No audio playing** - Make sure audio is actually playing through the selected device

### Issue: Audio chunks received but no transcription
**Possible causes:**
1. **Audio level too low** - The silence threshold might be filtering out quiet audio
2. **ML Service not running** - Check if ML service is running on port 8000
3. **Whisper model not loaded** - Check ML service logs

## Debugging Steps

1. **Check device list:**
   - Open the app
   - Go to Audio Settings
   - Check if your desired device appears in the list
   - Look for devices like "Stereo Mix" or "CABLE Output"

2. **Check console logs:**
   - Open browser DevTools (F12) in the app
   - Check Console tab for:
     - "Received X audio chunks" messages
     - Any error messages
     - Audio level information

3. **Check Rust logs:**
   - Look at the Tauri app terminal window
   - Should see:
     - "Found X audio input devices"
     - "Using audio device: [name]"
     - "Audio capture started successfully"
     - Any error messages

4. **Test with microphone first:**
   - Select your microphone
   - Start capture
   - Speak into microphone
   - Check if audio chunks are received

5. **Test with system audio:**
   - Install VB-Audio Virtual Cable
   - Set CABLE Input as default playback device
   - Enable "Listen to this device" on CABLE Output
   - Select "CABLE Output" in the app
   - Play audio (YouTube, game, etc.)
   - Check if audio chunks are received

## Next Steps

If audio is still not being captured:
1. Check the terminal/console for error messages
2. Verify the selected device is correct
3. Ensure audio is actually playing through the selected device
4. Check Windows audio settings
5. Try a different audio device to isolate the issue

