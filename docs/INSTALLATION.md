# Installation Guide

## System Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 500 MB free space
- **Internet Connection**: Required for translation services
- **Audio**: Audio output device (headphones or speakers)

## Installation Steps

### Option 1: Using the Installer (Recommended)

1. **Download the installer**

   - Download `GameVoiceTranslator_Setup.exe` from your purchase
   - Save it to a location you can easily find (e.g., Downloads folder)

2. **Run the installer**

   - Double-click the installer file
   - If Windows shows a security warning, click "More info" then "Run anyway"
   - Follow the installation wizard:
     - Accept the license agreement
     - Choose installation location (default is recommended)
     - Select additional options (desktop shortcut, etc.)
     - Click "Install"

3. **Launch the application**
   - The installer will offer to launch the app when finished
   - Or find "Real-Time Game Voice Translation" in your Start Menu
   - Or double-click the desktop shortcut (if created)

### Option 2: Portable Version

1. **Extract the files**

   - Download the portable ZIP file
   - Extract it to a folder (e.g., `C:\GameVoiceTranslator\`)
   - Do not extract to Program Files (permissions issues)

2. **Run the application**
   - Double-click `GameVoiceTranslator.exe`
   - The first time you run it, Windows may show a security warning

## First-Time Setup

### 1. License Activation (if required)

### 2. Audio Setup

The application needs to capture game audio. Choose one of these methods:

#### Method 1: VB-Audio Virtual Cable (Recommended)

1. **Download and install VB-Audio Virtual Cable**

   - Download from: https://vb-audio.com/Cable/
   - Install and **restart your computer** (required!)

2. **Configure Windows Audio**

   - Right-click the speaker icon in system tray → "Sounds"
   - **Playback tab**: Set "CABLE Input" as default device
   - **Recording tab**: Right-click "CABLE Output" → Properties → Listen tab
     - Check "Listen to this device"
     - Select your headphones in the dropdown
     - Click Apply

3. **In the application**
   - Click "Auto-Configure" button
   - Or manually select "Game Audio (Recommended)" from the dropdown

#### Method 2: Stereo Mix (May not work on all systems)

1. **Enable Stereo Mix**

   - Right-click speaker icon → "Sounds" → "Recording" tab
   - Right-click empty space → "Show Disabled Devices"
   - Right-click "Stereo Mix" → Enable
   - Set as default if prompted

2. **In the application**
   - Select "System Audio" from the audio device dropdown

### 3. Configure Settings

1. **Select target language**

   - Choose the language you want translations to appear in
   - Default is English

2. **Adjust subtitle settings**

   - Enable/disable on-screen subtitles
   - Adjust subtitle size with the slider
   - Position will be at bottom center by default

3. **Test the setup**
   - Click "Test Audio" to verify your audio setup
   - Play some audio (YouTube video, game, etc.)
   - Click "Start Translation" to begin

## Troubleshooting

### "No license found" or License activation fails

- Make sure you're entering the license key exactly as provided
- License key format: XXXX-XXXX-XXXX-XXXX (16 hex characters)
- Contact support if you've lost your license key

### No audio captured

- Verify audio is actually playing on your computer
- Check that the correct audio device is selected
- For VB-Audio: Make sure "CABLE Input" is set as default playback device
- For Stereo Mix: Make sure it's enabled in Windows Sound settings
- Try clicking "Test Audio" button for diagnostics

### Application won't start

- Make sure you have Windows 10/11 (64-bit)
- Check Windows Event Viewer for error details
- Try running as Administrator (right-click → Run as administrator)
- Reinstall if the problem persists

### Translation not working

- Check your internet connection (required for translation API)
- Verify that speech is being detected (check the activity log)
- Make sure audio is actually playing and contains speech

### High latency/delay

- Use a smaller Whisper model (Settings → Advanced)
- Reduce audio buffer size
- Disable TTS if not needed
- Close other resource-intensive applications

## Uninstallation

### Using Windows Settings

1. Open Windows Settings → Apps
2. Find "Real-Time Game Voice Translation"
3. Click "Uninstall"
4. Follow the prompts

### Using Control Panel

1. Open Control Panel → Programs and Features
2. Find "Real-Time Game Voice Translation"
3. Click "Uninstall"
4. Follow the prompts

### Manual Uninstallation (Portable Version)

1. Close the application if running
2. Delete the folder where you extracted the files
3. Delete the license file: `%USERPROFILE%\.csgo2_translation\license.dat`
4. Remove desktop shortcuts manually if created

## Getting Help

- **Documentation**: Check the `docs/` folder in the installation directory
- **Support Email**: 1-9438889487_112@zohomail.com
- **FAQ**: See `docs/SOLUTIONS.md` for common issues

## Next Steps

After installation and setup:

1. Launch your game (CS:GO 2, Valorant, Apex Legends, Dota 2, or any competitive multiplayer game)
2. Start the translation application
3. Click "Start Translation"
4. Play the game - translations will appear as subtitles!

Enjoy real-time voice translation in your favorite games!
