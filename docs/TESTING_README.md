# Testing Documentation

This project includes both automated and manual testing to ensure all features work correctly.

## Quick Start

### For Quick Testing (5 minutes)
👉 **See [QUICK_TEST_CHECKLIST.md](QUICK_TEST_CHECKLIST.md)**

### For Comprehensive Testing
👉 **See [MANUAL_TESTING_GUIDE.md](MANUAL_TESTING_GUIDE.md)**

### For Automated Tests
👉 **See [TEST_COVERAGE.md](TEST_COVERAGE.md)**

---

## Test Files Overview

### Manual Testing
- **`QUICK_TEST_CHECKLIST.md`** - 5-minute quick test of critical features
- **`MANUAL_TESTING_GUIDE.md`** - Comprehensive step-by-step testing guide

### Automated Testing
- **`test_tauri_integration.py`** - Basic integration tests (6 tests)
- **`test_overlay_debug.py`** - Overlay logic tests (2 tests)
- **`test_comprehensive_tauri.py`** - Comprehensive test suite (10+ tests)

### Documentation
- **`TEST_COVERAGE.md`** - Test coverage analysis and recommendations
- **`DEBUG_SUMMARY.md`** - Debug summary for reported issues

---

## Testing the Reported Issues

### 1. Stop Translation Button
**Manual Test**: See `MANUAL_TESTING_GUIDE.md` - Test 4
- Verify button appears in header
- Click and verify processing stops
- Verify status updates correctly

### 2. Close Button / Window Close
**Manual Test**: See `MANUAL_TESTING_GUIDE.md` - Test 5
- Click window close button
- Verify app closes without hanging
- Check console for cleanup messages

### 3. Subtitles / Overlay Display
**Manual Test**: See `MANUAL_TESTING_GUIDE.md` - Test 6
- Verify overlay settings are enabled
- Play audio with speech
- Check console for pipeline messages
- Verify overlay window appears

---

## Running Tests

### Automated Tests (Python)
```bash
# Basic tests
python test_tauri_integration.py

# Overlay logic tests
python test_overlay_debug.py

# Comprehensive tests
python test_comprehensive_tauri.py
```

### Manual Tests
1. Start ML service: `.\start_ml_service.ps1`
2. Start Tauri app: `.\start_app.ps1`
3. Follow `QUICK_TEST_CHECKLIST.md` or `MANUAL_TESTING_GUIDE.md`

---

## Debugging

### Console Commands (Browser F12)
```javascript
// Test overlay directly
await window.__TAURI__.invoke('show_overlay_text', { text: 'Test subtitle' });

// Check audio capture
await window.__TAURI__.invoke('is_capturing');

// Get config
const config = await window.__TAURI__.invoke('get_config');
console.log(config);
```

### Key Console Messages
Look for these `===` markers:
- `=== TRANSCRIBING ===` - Transcription started
- `=== TRANSCRIPTION RESULT ===` - Transcription completed
- `=== SHOWING OVERLAY ===` - Overlay should display
- `=== OVERLAY RECEIVED EVENT ===` - Overlay window received message

---

## Test Results

After running tests, document results:
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Warnings/Issues
- 📝 Notes and observations

---

## Need Help?

- **Quick test**: See `QUICK_TEST_CHECKLIST.md`
- **Detailed testing**: See `MANUAL_TESTING_GUIDE.md`
- **Coverage analysis**: See `TEST_COVERAGE.md`
- **Debugging**: See `DEBUG_SUMMARY.md`

