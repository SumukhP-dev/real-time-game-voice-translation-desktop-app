# SquadSpeak

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
- **Virtual Microphone Output**: Routes translated voice to a virtual microphone for game compatibility (optional)
- **Smart Language Detection**: Automatically detects teammate languages and adjusts your translation target
- **Low Latency**: Optimized for real-time performance with minimal delay (<1 second with local models)
- **Multiple Language Support**: Translate to/from 15+ languages (including Polish, Ukrainian, Portuguese, Turkish based on gaming playerbase)
- **Easy Setup**: Auto-configuration wizard and intuitive interface
- **Hardware-Bound License**: Secure license system tied to your computer
- **Modern Electron UI**: Cross-platform desktop application with web technologies

## System Requirements

- **Operating System**: Windows 10/11 (64-bit), **macOS 12+** (Intel or Apple Silicon), or Linux (development)
- **RAM**: 4 GB minimum (8 GB recommended)
- **Storage**: 2 GB free space (for translation models, one-time download)
- **Internet Connection**: Optional (only needed for initial model download, translation works offline)
- **Audio**: Audio output device (headphones or speakers)
- **Additional**: Node.js 16+ (for development/building only)

## Quick Start

### 1. Installation

**Windows — installer (recommended)**:

1. Download `SquadSpeak_Setup.exe` (or your build’s NSIS installer)
2. Run the installer and follow the wizard
3. Launch from Start Menu or desktop shortcut

**Windows — portable**: Extract the portable ZIP and run `SquadSpeak.exe`

**macOS**:

1. Download `SquadSpeak-<version>.dmg`
2. Drag the app to Applications and open it (see [macOS Setup Guide](docs/guides/setup/MACOS_SETUP.md) for permissions and audio)

**Development Setup**:

```bash
# Clone and run the Electron application
python main.py
```

See [Installation Guide](docs/guides/setup/INSTALLATION.md) for detailed instructions.

### 2. Audio Setup

**Windows / macOS (recommended): loopback capture**

- **Windows**: WASAPI loopback via your headphones/speakers device name  
- **macOS**: Core Audio loopback — pick the device marked **[Loopback]** in Audio Settings  
  See [macOS Setup Guide](docs/guides/setup/MACOS_SETUP.md) for permissions and troubleshooting.

1. Launch the app and open **Audio Settings**
2. Select your **headphones or speakers** (look for **[Loopback]** on Windows/macOS)
3. Click **Start Capture**
4. Play game or system audio — status logs should show non-zero audio levels

No virtual audio cable is required. See [Audio Device Guide](docs/guides/audio/AUDIO_DEVICE_GUIDE.md) for details.

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
pip install -r -app/ml-service/requirements.txt

# Install Node.js dependencies
cd -app
npm install

# Run development server
npm run  dev
```

**Building for Distribution**:
```bash
# Build for the current OS (Windows, macOS, or Linux)
python build_electron.py

# Or target explicitly (macOS DMG must be built on a Mac)
python build_electron.py --platform mac
python build_electron.py --platform win
```

### Architecture

The application consists of:
- **Electron Frontend**: React + TypeScript web interface
- **ML Service**: FastAPI Python backend for speech recognition and translation
- **Audio Processing**: Real-time audio capture and processing

## Documentation

Documentation is organized under [`docs/`](docs/README.md) (see the [index](docs/README.md) for all categories).

- **[Installation Guide](docs/guides/setup/INSTALLATION.md)** - Detailed installation instructions
- **[Audio Device Guide](docs/guides/audio/AUDIO_DEVICE_GUIDE.md)** - WASAPI loopback and device selection
- **[Troubleshooting](docs/guides/troubleshooting/SOLUTIONS.md)** - Common issues and solutions
- **[Quick Start Guide](docs/guides/setup/QUICKSTART.md)** - 5-minute quick start

## Support

- **Support Email**: gaminglivevoicetranslationmod@gmail.com
- **Documentation**: Check the `docs/` folder
- **FAQ**: See [Troubleshooting Guide](docs/guides/troubleshooting/SOLUTIONS.md)

## Audio Device Setup

### For system / game audio capture (Windows)

The app uses **WASAPI loopback** to capture what plays through your chosen output device (headphones, speakers, headset) without changing your Windows default device.

1. Open **Audio Settings** in the app
2. Pick a device named like `Your Headphones (WASAPI loopback)`
3. Click **Start Capture**
4. Play game voice chat or any audio and confirm RMS levels in the status log

**Optional fallback: Stereo Mix**

If no loopback device appears, enable **Stereo Mix** in Windows Sound → Recording → Show disabled devices, then select it in the app. See [Audio Device Guide](docs/guides/audio/AUDIO_DEVICE_GUIDE.md).

### For Microphone Input (Testing Only):

- Select your microphone from the audio device dropdown
- **Warning:** This will NOT capture system/game audio, only microphone input

## Troubleshooting

### No audio captured / Getting static

- Confirm the correct **WASAPI loopback** device is selected (your headphones/speakers)
- Ensure **Start Capture** is active and the ML service is running
- Verify audio is actually playing (check system volume)
- Check status logs for RMS=0 warnings
- See `docs/guides/audio/AUDIO_DEVICE_GUIDE.md` and `docs/guides/audio/FIX_AUDIO_ROUTING.md` for troubleshooting

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

- **Windows**: System audio capture uses WASAPI loopback (Stereo Mix optional fallback)
- **macOS**: Loopback capture via Core Audio; virtual mic / outgoing voice routing is limited compared to Windows
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

- `AUDIO_DEVICE_GUIDE.md` - WASAPI loopback and device selection
- `FIX_AUDIO_ROUTING.md` - Troubleshooting audio routing issues
- `AUDIO_RECORDING_GUIDE.md` - Using the audio recording feature
- `QUICKSTART.md` - Quick start guide
- And more...

## Credits

- OpenAI Whisper for speech recognition
- EasyNMT and Opus-MT models for local translation (offline, no API keys)
- PyQt6 for GUI and overlay
- PyAudio and sounddevice for audio capture
- WASAPI / Core Audio loopback for system audio capture (Windows and macOS)
