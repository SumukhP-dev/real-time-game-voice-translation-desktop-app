# Quick Test Checklist

Use this for rapid testing of critical features.

## Critical Issues (Must Test)

- [ ] **Stop Translation Button**: Click works, stops processing, status updates
- [ ] **Close Button**: App closes without hanging, cleanup runs
- [ ] **Subtitles**: Overlay appears when translation occurs
- [ ] **Checkboxes**: Can toggle on/off, state persists

## Quick Test (5 minutes)

1. [ ] Start app → Window opens
2. [ ] Start audio capture → Status shows "Receiving audio..."
3. [ ] Click "Stop Translation" → Status shows "Translation paused"
4. [ ] Click "Start Translation" → Status shows "Translation active"
5. [ ] Play audio with speech → Check console for transcription
6. [ ] Verify overlay appears (if languages differ)
7. [ ] Close app → Closes cleanly

## Console Checks (F12)

Look for these messages:
- [ ] `=== TRANSCRIBING ===` - Transcription attempted
- [ ] `=== TRANSCRIPTION RESULT ===` - Transcription result
- [ ] `=== SHOWING OVERLAY ===` - Overlay should display
- [ ] `=== OVERLAY RECEIVED EVENT ===` - Overlay window received message

## If Issues Found

1. Check console for errors
2. Verify settings (overlay enabled, languages set)
3. Test overlay directly: `await window.__TAURI__.invoke('show_overlay_text', { text: 'Test' });`
4. Report with console logs and steps to reproduce

