# Voice Translation Setup Guide

## Overview

Voice Translation allows you to translate your voice to your teammates' languages in real-time. This feature works alongside the existing teammate translation feature, enabling full bidirectional communication.

## Prerequisites

1. **VB-Audio Cable** (for virtual microphone output)
   - Download from: https://vb-audio.com/Cable/
   - Install and restart your computer
   - This creates a virtual microphone that games can use

2. **Microphone** (for capturing your voice)
   - Any working microphone connected to your computer
   - Can be USB, 3.5mm jack, or built-in microphone

## Setup Steps

### 1. Install VB-Audio Cable

1. Download VB-Audio Cable from the official website
2. Run the installer
3. Restart your computer (required for driver installation)
4. Verify installation:
   - Open Windows Sound Settings
   - You should see "CABLE Input" in playback devices
   - You should see "CABLE Output" in recording devices

### 2. Configure Voice Translation in the App

1. Launch the application
2. Navigate to the "🎤 Voice Translation Settings" section
3. Enable "Translate My Voice to Teammates" checkbox
4. Select your output method:
   - **Speakers**: Play translated voice through your speakers/headphones
   - **Virtual Mic**: Route translated voice to VB-Audio Cable (for games)
   - **Both**: Use both speakers and virtual mic

### 3. Select Virtual Microphone Device

1. In the "Virtual Microphone" dropdown, select "VB-Audio Cable Input"
2. If not visible, click "Refresh Devices" button
3. The app will auto-detect VB-Audio Cable if installed

### 4. Configure Target Language Mode

Choose how the app determines what language to translate your voice to:

- **Auto-detect**: Automatically uses the most common language detected from teammates
  - Best for EU servers with multiple languages
  - Updates dynamically as teammates change
  
- **Configurable**: Manually select the target language
  - Best when you know your teammates' language
  - Choose from the language dropdown
  
- **Same as teammates**: Uses the same target language as your incoming translations
  - Best for consistent language pairs

### 5. Set Up Your Game

1. Open your game (CS:GO 2, Valorant, etc.)
2. Go to audio/voice settings
3. Set your microphone input to "CABLE Output" (or "VB-Audio Virtual Cable")
4. Adjust microphone volume/gain as needed

### 6. Start Translation

1. Click "Start Translation" in the app
2. The app will initialize:
   - Game audio capture (for teammate translations)
   - Microphone capture (for your voice)
   - Virtual microphone output (for routing to game)
3. You should see "✓ Voice translation pipeline initialized" in the log

## How It Works

1. **You speak** into your microphone
2. **App captures** your voice audio
3. **Speech recognition** transcribes your speech to text
4. **Language detection** determines your target language (based on mode)
5. **Translation** converts your text to the target language
6. **Text-to-Speech** generates audio in the target language
7. **Virtual mic output** routes the audio to VB-Audio Cable
8. **Game receives** the translated audio as if it came from your microphone

## Troubleshooting

### Virtual Microphone Not Available

**Problem**: App shows "Virtual microphone not available"

**Solutions**:
1. Verify VB-Audio Cable is installed
2. Restart your computer after installation
3. Check Windows Sound Settings for "CABLE Input" and "CABLE Output"
4. Try selecting the device manually in the dropdown
5. Click "Refresh Devices" button

### No Audio in Game

**Problem**: Translated voice doesn't appear in game

**Solutions**:
1. Verify game microphone is set to "CABLE Output"
2. Check game microphone volume/gain settings
3. Test virtual mic output by selecting "Speakers" mode first
4. Verify VB-Audio Cable is working in Windows Sound Settings
5. Check app log for error messages

### Wrong Language Translation

**Problem**: Your voice is translated to the wrong language

**Solutions**:
1. Check "Target Language Mode" setting
2. For auto-detect: Wait for more teammate translations to improve detection
3. For configurable: Manually select the correct language
4. Check that teammates are speaking clearly for better detection

### Microphone Not Working

**Problem**: App doesn't capture your microphone

**Solutions**:
1. Check Windows microphone permissions
2. Verify microphone is set as default input device
3. Test microphone in Windows Sound Settings
4. Try selecting microphone manually in app settings
5. Check app log for microphone errors

### Audio Feedback/Loop

**Problem**: You hear your own translated voice creating a loop

**Solutions**:
1. Use headphones instead of speakers
2. Disable "Speakers" output mode, use "Virtual Mic" only
3. Lower microphone sensitivity in Windows
4. Position microphone away from speakers

## Advanced Settings

### Microphone Device Selection

- The app uses your default microphone by default
- You can select a specific microphone in settings
- Useful if you have multiple microphones

### Output Method

- **Speakers**: Good for testing and hearing your translations
- **Virtual Mic**: Required for game integration
- **Both**: Useful for monitoring while gaming

### Language Detection Confidence

- Adjust "Min Confidence for Auto" in config if needed
- Lower values = more aggressive language switching
- Higher values = more stable language selection

## Best Practices

1. **Use headphones** to prevent audio feedback
2. **Test first** with "Speakers" mode to verify translation quality
3. **Start with auto-detect** mode for EU servers
4. **Switch to configurable** if you know your teammates' language
5. **Monitor the log** to see detected languages and translations
6. **Adjust game mic volume** to match your normal speaking volume

## Technical Details

- **Microphone capture**: Uses sounddevice library
- **Speech recognition**: OpenAI Whisper (same as teammate translation)
- **Translation**: Local AI models (EasyNMT/Opus-MT)
- **Text-to-Speech**: Google TTS (gTTS) for virtual mic output
- **Virtual mic routing**: sounddevice plays to VB-Audio Cable Input
- **Sample rate**: 44100 Hz (standard for TTS output)

## Support

If you encounter issues not covered here:
1. Check the app log for error messages
2. Review the main troubleshooting guide
3. Contact support with log details

