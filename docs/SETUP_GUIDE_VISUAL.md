# Visual Setup Guide

This guide provides step-by-step instructions with visual references for setting up the CS:GO 2 Live Voice Translation application.

## Prerequisites

- Windows 10 or Windows 11 (64-bit)
- Administrator rights (for VB-Audio installation)
- Internet connection (for initial setup only)

## Step 1: Install VB-Audio Virtual Cable

### Download

1. Open your web browser
2. Navigate to: **https://vb-audio.com/Cable/**
3. Click the **"Download"** button
4. Save the installer file (`VBCABLE_Setup.exe`)

### Install

1. **Right-click** the downloaded file
2. Select **"Run as administrator"**
3. Follow the installation wizard:
   - Click **"Install Driver"**
   - Wait for installation to complete
   - Click **"Finish"**
4. **IMPORTANT**: Restart your computer after installation

### Verify Installation

After restarting:
1. Right-click the speaker icon in system tray
2. Select **"Sounds"**
3. Go to **"Playback"** tab
4. You should see **"CABLE Input (VB-Audio Virtual Cable)"**
5. Go to **"Recording"** tab
6. You should see **"CABLE Output (VB-Audio Virtual Cable)"**

✅ **If you see both devices, installation was successful!**

---

## Step 2: Configure Windows Audio Settings

### Set CABLE Input as Default Playback Device

1. Right-click the **speaker icon** in Windows system tray (bottom-right)
2. Select **"Sounds"** or **"Sound settings"**
3. In the **"Playback"** tab:
   - Find **"CABLE Input (VB-Audio Virtual Cable)"**
   - **Right-click** on it
   - Select **"Set as Default Device"**
   - You should see a green checkmark ✓

**Visual Reference**: The device should show a green checkmark and say "Default Device"

### Enable "Listen to this device"

1. In the same **"Sounds"** window, go to **"Recording"** tab
2. Find **"CABLE Output (VB-Audio Virtual Cable)"**
3. **Right-click** on it → Select **"Properties"**
4. Go to **"Listen"** tab
5. ✅ **Check** the box **"Listen to this device"**
6. In the dropdown **"Playback through this device"**, select your headphones
   - Example: **"Headphones (Bose QC Headphones)"** or your actual headphone name
7. Click **"Apply"** then **"OK"**

**Visual Reference**: 
- "Listen" tab should have checkbox checked
- Dropdown should show your headphone device name

---

## Step 3: Launch the Application

### Start ML Service

1. Open PowerShell or Command Prompt
2. Navigate to the project directory:
   ```powershell
   cd "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod"
   ```
3. Activate virtual environment:
   ```powershell
   .\.venv311\Scripts\Activate.ps1
   ```
4. Start ML service:
   ```powershell
   cd tauri-app\ml-service
   python -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```
5. Keep this window open - the service must stay running

### Start Tauri App

1. Open a **new** PowerShell window
2. Navigate to tauri-app directory:
   ```powershell
   cd "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod\tauri-app"
   ```
3. Start the app:
   ```powershell
   npm run tauri dev
   ```

---

## Step 4: Configure Application Settings

### Audio Device Selection

1. In the application, go to **"Audio Settings"** section
2. Click **"Auto-Setup Audio"** button (recommended)
   - This will automatically configure audio routing
   - Follow the wizard if it appears
3. OR manually select **"CABLE Output (VB-Audio Virtual Cable)"** from the dropdown

### Translation Settings

1. Go to **"Translation Settings"** section
2. Select your **Target Language** (e.g., English)
3. ✅ Enable **"Enable Text Overlay"**
4. (Optional) Enable **"Enable Audio Playback (TTS)"**

### Subtitle Settings

1. Go to **"Subtitle Settings"** section
2. Adjust **Size** slider (12px - 72px)
3. Select **Style** preset (Minimal, Bold, Outline, etc.)
4. Select **Position** preset (Top, Bottom, Center, etc.)

---

## Step 5: Test the Setup

### Test Audio Capture

1. Click **"Start Capture"** in Audio Settings
2. Play a YouTube video with speech
3. You should:
   - ✅ Hear audio through your headphones
   - ✅ See audio levels in the app
   - ✅ See transcription attempts in the logs

### Test Translation

1. Start your game (CS:GO 2, Valorant, etc.)
2. Join a match with voice chat
3. When teammates speak:
   - ✅ You should see subtitles appear on screen
   - ✅ Subtitles should be in your target language
   - ✅ Translation log should show entries

---

## Troubleshooting

### No Audio Captured

**Symptoms**: App shows "Audio is silent (RMS=0)"

**Solutions**:
1. Verify CABLE Input is set as default playback device
2. Verify "Listen to this device" is enabled on CABLE Output
3. Check Windows volume is not muted
4. Restart the application

### Can't Hear Game Audio

**Symptoms**: No sound through headphones

**Solutions**:
1. Check "Listen to this device" is enabled
2. Verify correct headphone device is selected in dropdown
3. Check headphone volume in Windows
4. Try restarting Windows audio service

### Overlay Not Showing

**Symptoms**: No subtitles appear on screen

**Solutions**:
1. Verify "Enable Text Overlay" is checked
2. Check overlay position is within screen bounds
3. Try clicking "Test Overlay" button
4. Check if overlay window is behind game window

### Translation Not Working

**Symptoms**: Audio captured but no translations

**Solutions**:
1. Verify ML service is running (check PowerShell window)
2. Check ML service is accessible at http://127.0.0.1:8000
3. Check Status Logs for error messages
4. Verify target language is set correctly

---

## Visual Checklist

Before starting a game session, verify:

- [ ] VB-Audio Virtual Cable installed
- [ ] CABLE Input set as default playback device
- [ ] "Listen to this device" enabled on CABLE Output
- [ ] Headphones selected in "Listen" dropdown
- [ ] ML service is running
- [ ] Application is running
- [ ] Audio capture is started
- [ ] Overlay is enabled
- [ ] Target language is set
- [ ] Test overlay works (click "Test Overlay" button)

---

## Quick Reference

### Windows Sound Settings Shortcut

Press `Win + R`, type `mmsys.cpl`, press Enter

### Application Shortcuts

- **Setup Wizard**: Click "Setup Wizard" button in header
- **Auto-Setup Audio**: Click "Auto-Setup Audio" in Audio Settings
- **Test Overlay**: Click "Test Overlay" button in header

---

## Next Steps

Once setup is complete:

1. Launch your game
2. Join a match
3. Start capturing audio
4. Enjoy real-time translations!

For advanced features, see:
- [Translation Settings Guide](TRANSLATION_SETTINGS.md)
- [Subtitle Customization Guide](SUBTITLE_CUSTOMIZATION.md)
- [Troubleshooting Guide](SOLUTIONS.md)

---

**Need Help?** Contact support: 1-9438889487_112@zohomail.com

