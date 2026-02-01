# Real-Time Game Voice Translation

**Version 1.0.0** - Commercial Release

A professional desktop application that captures in-game voice chat from competitive multiplayer games (CS:GO 2, Valorant, Apex Legends, Dota 2, and more), transcribes speech in real-time, translates it to your preferred language, and displays translations as on-screen subtitles.

## 🚀 Powered by Electron

This application uses **Electron** as the desktop framework for maximum compatibility and mature ecosystem support.

## Purchase

This software is available for purchase at:

- **itch.io**: [Your itch.io product page]
- **Gumroad**: [Your Gumroad product page]

**Launch Price**: ~~$12.00~~ **$7.99 USD** (Limited time - Regular price $12.00)

## Features

- **Bidirectional Real-time Translation**:
  - **Teammate → You**: Translates teammates' voices to your language with on-screen subtitles
  - **You → Teammates**: Translates your voice to teammates' languages and routes to virtual microphone
- **Real-time Audio Capture**: Captures system audio or game-specific audio streams
- **Advanced Speech Recognition**: Uses OpenAI Whisper for accurate speech-to-text conversion with automatic language detection
- **Live Translation**: Translates speech to your preferred language using local AI models (works offline, no API keys needed)
- **On-Screen Subtitles**: Displays translated text as customizable subtitles overlay
- **Text-to-Speech**: Optional audio playback of translations
- **Virtual Microphone Output**: Routes translated voice to VB-Audio Cable for game compatibility
- **Smart Language Detection**: Automatically detects teammate languages and adjusts your translation target
- **Low Latency**: Optimized for real-time performance with minimal delay (<1 second with local models)
- **Multiple Language Support**: Translate to/from 15+ languages (including Polish, Ukrainian, Portuguese, Turkish based on gaming playerbase)
- **Easy Setup**: Auto-configuration wizard and intuitive interface
- **Hardware-Bound License**: Secure license system tied to your computer
- **Modern Electron UI**: Cross-platform desktop application with web technologies

## System Requirements

- **Operating System**: Windows 10 or Windows 11 (64-bit)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 2 GB free space (for translation models, one-time download)
- **Internet Connection**: Optional (only needed for initial model download, translation works offline)
- **Audio**: Audio output device (headphones or speakers)
- **Additional**: Node.js 16+ (for development/building only)

## Quick Start

### 1. Installation

**Using the Installer (Recommended)**:

1. Download `GameVoiceTranslator_Setup.exe`
2. Run the installer and follow the wizard
3. Launch from Start Menu or desktop shortcut

**Portable Version**:

1. Extract the ZIP file to a folder
2. Run `GameVoiceTranslator.exe`

**Development Setup**:

```bash
# Clone and run the Electron application
python main.py
```

See [Installation Guide](docs/INSTALLATION.md) for detailed instructions.

### 2. Audio Setup

**Recommended: VB-Audio Virtual Cable**

1. Download and install [VB-Audio Virtual Cable](https://vb-audio.com/Cable/) (FREE)
2. Restart your computer
3. Set "CABLE Input" as default playback device in Windows Sound settings
4. Enable "Listen to this device" on "CABLE Output" (select your headphones)
5. In the app, click "Auto-Configure" or select "Game Audio (Recommended)"

See [Audio Setup Guide](docs/VB_AUDIO_SETUP_GUIDE.md) for detailed instructions.

### 3. Start Translating

1. Launch your game (CS:GO 2, Valorant, Apex Legends, Dota 2, or any competitive multiplayer game)
2. Open the translation application
3. Click "Start Translation"
4. Play the game - translations will appear as subtitles!

## Usage

### Basic Workflow

1. **Launch the application** - Find it in Start Menu or use desktop shortcut
2. **Configure audio** - Click "Auto-Configure" or select audio device manually
3. **Select target language** - Choose what language to translate TO (default: English)
4. **Adjust settings**:
   - Enable/disable on-screen subtitles
   - Adjust subtitle size with slider
   - Enable/disable text-to-speech (disabled for game audio to prevent feedback)
5. **Start translation** - Click "Start Translation" button
6. **Play your game** - Translations will appear as subtitles in real-time!

### Settings

- **Translation Language**: Choose target language (15+ languages including English, Russian, Spanish, German, French, Portuguese, Polish, Turkish, Chinese, Japanese, Korean, Ukrainian, Italian, Arabic, Hindi)
- **Subtitle Display**: Toggle on-screen subtitles on/off
- **Subtitle Size**: Adjust text size (12-48px)
- **Text-to-Speech**: Play translations as speech (disabled for system audio)

## Development

### Building from Source

**Prerequisites**:
- Python 3.8+
- Node.js 16+
- Rust 1.70+

**Development Setup**:
```bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r tauri-app/ml-service/requirements.txt

# Install Node.js dependencies
cd tauri-app
npm install

# Run development server
npm run tauri dev
```

**Building for Distribution**:
```bash
# Build distributable packages
python build_electron.py
```

### Architecture

The application consists of:
- **Electron Frontend**: React + TypeScript web interface
- **ML Service**: FastAPI Python backend for speech recognition and translation
- **Audio Processing**: Real-time audio capture and processing

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed installation instructions
- **[Audio Setup Guide](docs/VB_AUDIO_SETUP_GUIDE.md)** - Complete audio configuration guide
- **[Troubleshooting](docs/SOLUTIONS.md)** - Common issues and solutions
- **[Quick Start Guide](docs/QUICKSTART.md)** - 5-minute quick start

## Support

- **Support Email**: 1-9438889487_112@zohomail.com
- **Documentation**: Check the `docs/` folder
- **FAQ**: See [Troubleshooting Guide](docs/SOLUTIONS.md)

## Audio Device Setup

### For System Audio Capture (Game Audio):

**⚠ IMPORTANT:** To capture game/system audio (not microphone), you need a virtual audio device.

**Windows:**

**Option 1: VB-Audio Virtual Cable (RECOMMENDED - Most Reliable)**

**Complete Setup Steps:**

1. **Download and Install:**

   - Download: https://vb-audio.com/Cable/ (FREE)
   - Install VB-Audio Virtual Cable
   - **Restart your computer** (required!)

2. **Configure Windows Audio:**

   **A. Set CABLE Input as Default Playback Device:**

   - Right-click speaker icon → "Sounds"
   - Go to "Playback" tab
   - Find "CABLE Input (VB-Audio Virtual Cable)"
   - Right-click → "Set as Default Device"
   - ✅ Should have green checkmark

   **B. Enable "Listen to this device" (to hear audio through headphones):**

   - In same "Sounds" window, go to "Recording" tab
   - Find "CABLE Output (VB-Audio Virtual Cable)"
   - Right-click → "Properties"
   - Go to "Listen" tab
   - ✅ Check "Listen to this device"
   - In dropdown, select your headphones (e.g., "Headphones (Bose QC Headphones)")
   - Click "Apply" then "OK"

3. **Configure Translation App:**

   - Run: `python main_tkinter.py`
   - Click "Select Stereo Mix" button (auto-selects CABLE Output)
   - Or manually select "CABLE Output" from audio device dropdown
   - Click "Start Translation"

4. **Test:**
   - Play a YouTube video or any audio
   - You should hear it through headphones (via "Listen to this device")
   - The app should capture and transcribe it

**See `docs/VB_AUDIO_SETUP_GUIDE.md` for complete step-by-step instructions**

**Option 2: Stereo Mix (May Not Work)**

1. Right-click speaker icon in system tray
2. Select "Sounds" → "Recording" tab
3. Right-click in empty space → "Show Disabled Devices"
4. Enable "Stereo Mix"
5. In the app, click "Select Stereo Mix" button
6. **Note:** Many systems have Stereo Mix on WDM-KS drivers which cannot be accessed. If you get errors, use VB-Audio Virtual Cable instead.

### For Microphone Input (Testing Only):

- Select your microphone from the audio device dropdown
- **Warning:** This will NOT capture system/game audio, only microphone input

## Troubleshooting

### No audio captured / Getting static

- **Click "Check System Audio" button** in the app for diagnostics
- **Verify CABLE Input is set as Default Playback Device:**
  - Windows Sound → Playback tab → CABLE Input should have green checkmark
- **Check "Listen to this device" is enabled:**
  - Windows Sound → Recording tab → CABLE Output → Properties → Listen tab
  - Should be checked with headphones selected
- Verify audio is actually playing (check system volume)
- Run `python diagnose_audio_routing.py` to test audio levels
- If using Stereo Mix and getting errors, install VB-Audio Virtual Cable instead
- See `docs/VB_AUDIO_SETUP_GUIDE.md` and `docs/FIX_AUDIO_ROUTING.md` for troubleshooting

### Translation not working

- Verify that speech is being detected (check transcription log)
- If using local models, ensure models downloaded successfully (check first-run logs)
- If using API fallback, check internet connection

### High latency

- Use a smaller Whisper model (tiny or base instead of small/medium)
- Reduce audio buffer size in config
- Disable TTS if not needed

### Overlay not showing

- Check that overlay is enabled in settings
- Verify overlay position is within screen bounds
- Check Windows display scaling settings

## Performance Tips

- Use Whisper "tiny" model for fastest performance (less accurate)
- Use Whisper "base" or "small" for better accuracy (slower)
- Disable TTS if you only need text overlay
- Adjust audio chunk size for balance between latency and stability

## Limitations

- **Windows**: System audio capture requires WASAPI or virtual audio cable (VB-Audio Virtual Cable recommended)
- Real-time processing may have <1 second delay with local models (faster than API)
- Translation model download required on first run (~500MB-1GB, one-time download)
- Whisper model download required on first run (~75MB for tiny model)
- Overlay click-through is supported on Windows

## License

This is commercial software distributed through itch.io.

**License Terms**:

- Single-user license per purchase
- See EULA for complete terms

**Purchase**: Available on [itch.io]([Your itch.io link]) - **Launch Price: $7.99** (Regular price: $12.00)

## Additional Features

- **Audio Recording**: Automatically saves captured audio for debugging (last 30 seconds)
- **False Positive Filtering**: Filters out common mis-transcriptions from background noise
- **Multiple Audio Capture Methods**: Automatically tries different methods for maximum compatibility
- **Comprehensive Logging**: Detailed activity log for troubleshooting
- **Auto-Configuration**: Smart audio device detection and setup
- **Modern UI**: Clean, intuitive interface designed for gamers

## Documentation

See the `docs/` folder for detailed guides:

- `VB_AUDIO_SETUP_GUIDE.md` - Complete VB-Audio Virtual Cable setup
- `FIX_AUDIO_ROUTING.md` - Troubleshooting audio routing issues
- `AUDIO_RECORDING_GUIDE.md` - Using the audio recording feature
- `QUICKSTART.md` - Quick start guide
- And more...

## Credits

- OpenAI Whisper for speech recognition
- EasyNMT and Opus-MT models for local translation (offline, no API keys)
- PyQt6 for GUI and overlay
- PyAudio and sounddevice for audio capture
- VB-Audio Virtual Cable for system audio routing
