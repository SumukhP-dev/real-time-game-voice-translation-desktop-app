# Testing Setup Steps Guide

This guide helps you systematically test all setup wizard steps to ensure they work correctly.

## Quick Start

### Run Automated Tests

```bash
python scripts/test_setup_wizard.py --auto
```

### View Manual Test Procedures

```bash
python scripts/test_setup_wizard.py --manual
```

## Setup Steps Overview

The setup wizard has 3 main steps:

1. **Welcome** - Introduction and overview
2. **Audio Setup** - Configure audio capture device
3. **Complete** - Language selection and final instructions

## Testing Checklist

### Prerequisites

- [ ] Application can be launched
- [ ] Python dependencies are installed
- [ ] Config file exists or can be created

### Step 1: Welcome Screen

**What to Test:**

- [ ] Wizard window opens when triggered
- [ ] Window is properly sized and centered
- [ ] Title displays: "Welcome to Real-Time Game Voice Translation!"
- [ ] Welcome text is readable and properly formatted
- [ ] "Next →" button is enabled
- [ ] "← Back" button is disabled (first step)
- [ ] Progress indicator shows "Step 1 of 3: Getting Started"
- [ ] Window is modal (blocks interaction with main window)
- [ ] Can click "Next →" to proceed

**How to Test:**

1. Launch the application
2. Trigger setup wizard (usually on first launch or from Help menu)
3. Verify all UI elements appear correctly
4. Click "Next →" to proceed

### Step 2: Audio Setup

**What to Test:**

- [ ] "Setting Up Audio" title displays
- [ ] Status message shows correct state:
  - ✓ "Audio is ready!" (if VB-Audio is configured)
  - "Configuring audio..." (if needs auto-config)
  - "Installation needed" (if VB-Audio not installed)
- [ ] Install button appears when needed
- [ ] Auto-configuration runs when appropriate
- [ ] "← Back" button is enabled
- [ ] "Next →" button is enabled
- [ ] Progress shows "Step 2 of 3: Setting Up Audio"

**Test Scenarios:**

#### Scenario A: VB-Audio Already Installed & Configured

- [ ] Status shows "✓ Audio is ready!"
- [ ] No install button appears
- [ ] Can proceed to next step

#### Scenario B: VB-Audio Installed But Not Configured

- [ ] Status shows "Configuring audio..."
- [ ] Auto-configuration runs automatically
- [ ] Status updates to "✓ Audio is ready!"
- [ ] Can proceed to next step

#### Scenario C: VB-Audio Not Installed

- [ ] Status shows "Installation needed"
- [ ] "📥 Install Audio Driver" button appears
- [ ] Click install button:
  - [ ] Progress window appears
  - [ ] Download starts and completes
  - [ ] Installation runs
  - [ ] Success message appears
  - [ ] Auto-configuration runs after install
  - [ ] Status updates to "✓ Audio is ready!"

**How to Test:**

1. Navigate to Step 2 from Welcome screen
2. Check status message matches your system state
3. If install needed, test installation flow
4. Verify auto-configuration works
5. Test navigation (back/next buttons)

### Step 3: Completion

**What to Test:**

- [ ] "You're All Set! 🎉" title displays
- [ ] Language selector dropdown is visible
- [ ] Language dropdown is functional:
  - [ ] Can select different languages
  - [ ] Selection saves to config
- [ ] Usage instructions are clear and readable
- [ ] "← Back" button is enabled
- [ ] "Finish" button is shown (instead of "Next →")
- [ ] Progress shows "Step 3 of 3: You're Ready!"

**How to Test:**

1. Navigate to Step 3 from Audio Setup
2. Test language selector:
   - Select different languages
   - Verify selection persists
3. Click "Finish":
   - [ ] "Setup Complete" message appears
   - [ ] Wizard window closes
   - [ ] `setup_complete` is saved to config.json
4. Test back navigation to previous steps

### Configuration Persistence

**What to Test:**

- [ ] After completing setup, `config.json` contains:
  ```json
  {
    "app": {
      "setup_complete": true
    }
  }
  ```
- [ ] After restarting application:
  - [ ] Setup wizard does NOT appear automatically
  - [ ] Application remembers setup is complete
- [ ] If `setup_complete` is manually set to `false`:
  - [ ] Setup wizard appears on next launch

**How to Test:**

1. Complete setup wizard
2. Check `config.json` file in project root
3. Verify `setup_complete` is `true`
4. Restart application
5. Verify wizard doesn't appear
6. Manually edit config to set `setup_complete: false`
7. Restart application
8. Verify wizard appears again

### Audio Driver Installation Flow

**What to Test:**

- [ ] Download process:
  - [ ] Progress bar updates correctly
  - [ ] Status messages are clear
  - [ ] Download completes successfully
- [ ] Installation process:
  - [ ] Installer runs (silent or with UI)
  - [ ] Installation completes
  - [ ] Success message appears
- [ ] Post-installation:
  - [ ] Auto-configuration runs
  - [ ] Status updates correctly
  - [ ] Can proceed with setup

**How to Test:**

1. Uninstall VB-Audio Virtual Cable (if installed)
2. Restart computer
3. Launch application and trigger setup wizard
4. Go to Audio Setup step
5. Click "Install Audio Driver"
6. Monitor download and installation process
7. Verify auto-configuration runs after install

### Error Handling

**What to Test:**

- [ ] Network errors during download:
  - [ ] Error message is clear and helpful
  - [ ] Manual download link is provided
- [ ] Installation failures:
  - [ ] Error message explains the issue
  - [ ] User can retry or install manually
- [ ] Auto-configuration failures:
  - [ ] Setup can still proceed
  - [ ] User is not blocked from continuing

**How to Test:**

1. Disconnect internet and try installation
2. Test with corrupted download
3. Test with installation permissions issues
4. Verify error messages are user-friendly

## Automated Testing

The test script includes automated unit tests for:

- Wizard initialization
- Step navigation
- UI element creation
- Configuration saving
- Button state management

Run automated tests:

```bash
python scripts/test_setup_wizard.py --auto
```

## Manual Testing

For thorough testing, follow the manual test procedures:

```bash
python scripts/test_setup_wizard.py --manual
```

This will print detailed test procedures for each step.

## Quick Test Commands

### Test Audio Device Detection

```bash
python scripts/check_cable_setup.py
```

### Test All Audio Devices

```bash
python scripts/check_devices.py
```

### Test Configuration

```python
from src.config.manager import Config
config = Config()
print(f"Setup complete: {config.get('app', 'setup_complete', default=False)}")
```

## Common Issues to Watch For

1. **Wizard doesn't appear on first launch**

   - Check if `setup_complete` is already `true` in config
   - Check if wizard trigger code is working

2. **Audio setup step shows wrong status**

   - Verify VB-Audio detection logic
   - Check platform-specific code paths

3. **Installation fails silently**

   - Check error handling in download/install code
   - Verify subprocess calls work correctly

4. **Configuration not saving**

   - Check file permissions
   - Verify config.save() is called
   - Check JSON serialization

5. **Wizard window layout issues**
   - Test on different screen resolutions
   - Check window centering code
   - Verify widget packing/gridding

## Test Environment Setup

### Clean Test Environment

1. Create a test config file or backup existing
2. Set `setup_complete: false` in config
3. Launch application
4. Test setup wizard flow

### With VB-Audio Installed

1. Ensure VB-Audio Virtual Cable is installed
2. Configure it properly
3. Test setup wizard with pre-configured audio

### Without VB-Audio

1. Uninstall VB-Audio Virtual Cable
2. Restart computer
3. Test installation flow in setup wizard

## Sign-Off Checklist

Before considering setup testing complete:

- [ ] All automated tests pass
- [ ] All manual test procedures completed
- [ ] Tested on clean system (no VB-Audio)
- [ ] Tested with VB-Audio pre-installed
- [ ] Tested with VB-Audio installed but not configured
- [ ] Configuration persistence verified
- [ ] Error handling tested
- [ ] UI/UX verified on different screen sizes
- [ ] Navigation between steps works correctly
- [ ] Setup completion flow works end-to-end

## Next Steps

After setup testing is complete:

1. Test full application flow (start translation, etc.)
2. Test with actual game audio
3. Test translation functionality
4. Test overlay display
5. See `TEST_CHECKLIST.md` for comprehensive testing
