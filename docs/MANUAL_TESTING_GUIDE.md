# Manual Testing Guide for CS:GO 2 Voice Translation Mod

This guide provides step-by-step instructions for manually testing all application features.

## Prerequisites

1. **Start Services**:
   ```powershell
   # Terminal 1: Start ML Service
   .\start_ml_service.ps1
   
   # Terminal 2: Start Tauri App
   .\start_app.ps1
   ```

2. **Verify Services Running**:
   - ML Service: http://127.0.0.1:8000/health should return 200
   - Tauri App: Window should open

3. **Audio Setup**:
   - VB-Audio Virtual Cable should be installed
   - Set Windows default playback device to VB-Audio Virtual Cable
   - Have audio source ready (game, music, etc.)

---

## Test Checklist

### ✅ Test 1: Application Startup

**Steps**:
1. Start ML service
2. Start Tauri app
3. Wait for app window to appear

**Expected Results**:
- [ ] App window opens without errors
- [ ] Status shows "Ready" or "Receiving audio..."
- [ ] All UI components are visible
- [ ] No console errors (check F12)

**Notes**: Record any errors in console

---

### ✅ Test 2: Audio Device Detection

**Steps**:
1. Open Audio Settings section
2. Check audio device dropdown

**Expected Results**:
- [ ] Audio devices are listed
- [ ] VB-Audio Virtual Cable appears in list
- [ ] Device shows sample rate and channels
- [ ] Can select different devices

**Notes**: If no devices appear, check Windows audio settings

---

### ✅ Test 3: Audio Capture Start/Stop

**Steps**:
1. Select an audio device (preferably VB-Audio Virtual Cable)
2. Click "Start Capture" button
3. Wait 5 seconds
4. Check status message
5. Click "Stop Capture" button
6. Check status message

**Expected Results**:
- [ ] "Start Capture" button becomes disabled after clicking
- [ ] Status shows "Capturing audio..." or similar
- [ ] Console shows "Audio capture started successfully"
- [ ] Status shows "Receiving audio... (X chunks)" after a few seconds
- [ ] "Stop Capture" button works
- [ ] Status updates when stopped
- [ ] "Start Capture" button becomes enabled again

**Notes**: 
- Check browser console (F12) for any errors
- Verify audio chunks are being received

---

### ✅ Test 4: Stop Translation Button ⚠️ (Reported Issue)

**Steps**:
1. Ensure audio capture is running
2. Look for "Stop Translation" button in header (top right)
3. Click "Stop Translation" button
4. Wait 5 seconds
5. Check status message
6. Verify audio is still being received
7. Click "Start Translation" button
8. Wait 5 seconds
9. Check status message

**Expected Results**:
- [ ] "Stop Translation" button is visible in header
- [ ] Button click works (no errors)
- [ ] Status shows "Translation stopped" or "(Translation paused)"
- [ ] Audio chunks still being received (status shows chunk count)
- [ ] No transcription/translation processing occurs
- [ ] "Start Translation" button appears
- [ ] Clicking "Start Translation" resumes processing
- [ ] Status shows "Translation active"

**Notes**: 
- Check console for any errors
- Verify `isTranslationActive` state changes
- Audio should continue but processing should stop

---

### ✅ Test 5: Window Close Button ⚠️ (Reported Issue)

**Steps**:
1. Ensure app is running
2. Start audio capture (optional)
3. Click window close button (X)
4. Observe app behavior

**Expected Results**:
- [ ] Window closes without hanging
- [ ] No "Not Responding" message
- [ ] App exits cleanly
- [ ] Console shows cleanup messages:
  - "Window close requested, cleaning up..."
  - "Audio capture stopped..."
  - "Cleanup complete, closing window..."
- [ ] No zombie processes left running

**Notes**: 
- If app hangs, check console for errors
- Verify cleanup handlers are called
- Check Task Manager for leftover processes

---

### ✅ Test 6: Subtitles/Overlay Display ⚠️ (Reported Issue)

**Steps**:
1. Ensure audio capture is running
2. Verify "Enable Text Overlay" checkbox is checked in Translation Settings
3. Set target language to something different from source (e.g., English → Spanish)
4. Play audio with speech through VB-Audio Virtual Cable
5. Wait for transcription and translation
6. Check for overlay window

**Expected Results**:
- [ ] Console shows `=== TRANSCRIBING ===` messages
- [ ] Console shows `=== TRANSCRIPTION RESULT ===` with text
- [ ] Console shows `=== SHOWING OVERLAY ===` messages
- [ ] Overlay window appears on screen
- [ ] Translated text is visible in overlay
- [ ] Overlay fades out after configured duration (default 5 seconds)

**Debugging Steps** (if subtitles don't appear):
1. Open browser console (F12)
2. Look for these messages in order:
   - `=== TRANSCRIBING ===` - Confirms transcription attempted
   - `=== TRANSCRIPTION RESULT ===` - Shows what Whisper returned
   - `=== SHOWING OVERLAY ===` - Confirms overlay should display
   - `=== OVERLAY RECEIVED EVENT ===` - Confirms overlay window got message
3. Check each step:
   - **No transcription?** → Audio level too low or no speech detected
   - **Empty transcription?** → Audio doesn't contain speech
   - **No overlay show?** → Check overlay enabled and language settings
   - **No overlay event?** → Overlay window not created

**Test Overlay Directly**:
```javascript
// In browser console (F12):
await window.__TAURI__.invoke('show_overlay_text', { text: 'Test subtitle' });
```
- [ ] Overlay window appears with "Test subtitle"
- [ ] Overlay fades out after 5 seconds

**Notes**: 
- Check Translation Settings: "Enable Text Overlay" must be checked
- If languages match, "Show Subtitles for Same Language" must be checked
- Check console for overlay errors

---

### ✅ Test 7: Translation Settings

**Steps**:
1. Open Translation Settings section
2. Change target language
3. Toggle "Enable Text Overlay" checkbox
4. Toggle "Enable Audio Playback (TTS)" checkbox
5. Toggle "Show Subtitles for Same Language" checkbox
6. Check console for errors

**Expected Results**:
- [ ] All checkboxes can be toggled on/off
- [ ] Checkbox state persists after toggle
- [ ] No console errors when toggling
- [ ] Target language dropdown works
- [ ] Settings are saved (verify by restarting app)

**Notes**: 
- Previously checkboxes couldn't be unselected - verify this is fixed
- Check console for config update errors

---

### ✅ Test 8: Transcription Pipeline

**Steps**:
1. Start audio capture
2. Play audio with clear speech
3. Monitor console (F12)
4. Check status messages

**Expected Results**:
- [ ] Console shows "Current audio level: X.XXXX threshold: 0.01" every 2 seconds
- [ ] Console shows "=== TRANSCRIBING ===" when audio level > 0.01
- [ ] Console shows "=== TRANSCRIPTION RESULT ===" with full JSON
- [ ] Status shows "Transcribed: [text]" when text is detected
- [ ] Status shows "No speech detected in audio" when no text

**Notes**: 
- Audio level should be above 0.01 for processing
- Check transcription result JSON for text, language, confidence

---

### ✅ Test 9: Translation Pipeline

**Steps**:
1. Ensure transcription is working
2. Set target language different from source
3. Wait for translation
4. Monitor console

**Expected Results**:
- [ ] Console shows "Translation result:" with original and translated text
- [ ] Status shows "Translated: [translated text]"
- [ ] Translation language codes are correct
- [ ] Translation is different from original (if languages differ)

**Notes**: 
- If translation same as original, check if languages match
- Check ML service logs for translation errors

---

### ✅ Test 10: Overlay Display Logic

**Test Case 1: Different Languages, Overlay Enabled**
- [ ] Source: English, Target: Spanish
- [ ] Overlay enabled: Yes
- [ ] Show same language: No
- [ ] **Expected**: Overlay should display

**Test Case 2: Same Languages, Show Same Enabled**
- [ ] Source: English, Target: English
- [ ] Overlay enabled: Yes
- [ ] Show same language: Yes
- [ ] **Expected**: Overlay should display

**Test Case 3: Same Languages, Show Same Disabled**
- [ ] Source: English, Target: English
- [ ] Overlay enabled: Yes
- [ ] Show same language: No
- [ ] **Expected**: Overlay should NOT display
- [ ] Console shows "Overlay not shown - reasons: ..."

**Test Case 4: Overlay Disabled**
- [ ] Overlay enabled: No
- [ ] **Expected**: Overlay should NOT display regardless of languages

---

### ✅ Test 11: Performance Monitoring

**Steps**:
1. Open Performance Monitor section
2. Click "Refresh" button
3. Check metrics displayed

**Expected Results**:
- [ ] CPU Usage is displayed
- [ ] Memory usage is displayed
- [ ] Metrics update when refresh clicked
- [ ] No errors in console

**Notes**: Previously showed "not yet wired" - verify this is fixed

---

### ✅ Test 12: Error Handling

**Test Case 1: ML Service Down**
1. Stop ML service
2. Try to transcribe audio
3. Check error handling

**Expected Results**:
- [ ] Error message displayed in status
- [ ] Console shows error details
- [ ] App doesn't crash
- [ ] Can restart service and continue

**Test Case 2: Invalid Audio**
1. Use very quiet audio (below threshold)
2. Check processing

**Expected Results**:
- [ ] Audio chunks received but not processed
- [ ] Console shows "Audio level too low, skipping"
- [ ] No transcription attempted

---

### ✅ Test 13: Configuration Persistence

**Steps**:
1. Change various settings (audio device, target language, overlay settings)
2. Close app
3. Restart app
4. Check if settings persisted

**Expected Results**:
- [ ] All settings are saved
- [ ] Settings restored on restart
- [ ] No default values overwriting saved settings

---

### ✅ Test 14: Match History

**Steps**:
1. Let app run and process some translations
2. Open Translation Log section
3. Check if translations are recorded

**Expected Results**:
- [ ] Translations appear in log
- [ ] Original and translated text shown
- [ ] Timestamps are correct
- [ ] Languages are displayed

---

## Issue Reporting Template

When reporting issues, include:

```
**Test**: [Test number and name]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
- 

**Actual Behavior**:
- 

**Console Output** (F12):
```
[paste console logs]
```

**Screenshots** (if applicable):
[attach screenshots]

**Environment**:
- OS: 
- ML Service: Running/Not Running
- Audio Device: 
- Target Language: 
```

---

## Quick Debug Commands

### Test Overlay Directly
```javascript
// In browser console (F12)
await window.__TAURI__.invoke('show_overlay_text', { text: 'Test subtitle' });
```

### Check Audio Capture Status
```javascript
await window.__TAURI__.invoke('is_capturing');
```

### Check Config
```javascript
const config = await window.__TAURI__.invoke('get_config');
console.log(config);
```

### Test Translation
```javascript
await window.__TAURI__.invoke('translate_text', {
  text: 'Hello',
  sourceLanguage: 'en',
  targetLanguage: 'es'
});
```

---

## Known Issues to Verify Fixed

1. ✅ **Stop Translation Button**: Should work without errors
2. ✅ **Close Button**: Should close cleanly without hanging
3. ✅ **Subtitles**: Should display when conditions are met
4. ✅ **Checkboxes**: Should be toggleable (can unselect)
5. ✅ **Performance Monitoring**: Should show actual metrics

---

## Testing Priority

**High Priority** (Reported Issues):
- Test 4: Stop Translation Button
- Test 5: Window Close Button
- Test 6: Subtitles/Overlay Display

**Medium Priority** (Core Features):
- Test 3: Audio Capture
- Test 8: Transcription Pipeline
- Test 9: Translation Pipeline
- Test 7: Translation Settings

**Low Priority** (Additional Features):
- Test 10: Overlay Display Logic
- Test 11: Performance Monitoring
- Test 12: Error Handling
- Test 13: Configuration Persistence
- Test 14: Match History

---

## Notes

- Always check browser console (F12) for detailed logs
- Look for `===` markers in console for key pipeline steps
- Test with different audio sources (game, music, speech)
- Test with different language pairs
- Verify all fixes from previous debugging sessions

