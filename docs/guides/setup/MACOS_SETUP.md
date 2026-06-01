# macOS Setup Guide

SquadSpeak runs on **macOS 12 (Monterey) or later** on Intel and Apple Silicon (arm64).

## System requirements

- macOS 12+ (64-bit Intel or Apple Silicon)
- 8 GB RAM recommended
- ~2 GB free disk space (models download on first run)
- Node.js 16+ and Python 3.8+ (development only)

## Install (end users)

1. Download `SquadSpeak-<version>.dmg` from your purchase page.
2. Open the DMG and drag **SquadSpeak** to Applications.
3. On first launch, macOS may block the app if it is not notarized. Open **System Settings → Privacy & Security** and choose **Open Anyway**, or right-click the app → **Open**.
4. Grant **Microphone** access when prompted (used for loopback/capture APIs).

## Audio setup (game voice capture)

1. Open **Audio Settings** in the app.
2. Choose your **headphones or speakers** — devices with **[Loopback]** capture what plays through that output (Core Audio loopback via `soundcard`).
3. Click **Start Capture** and play game or system audio; confirm non-zero RMS in the status log.

No virtual audio cable is required on macOS.

### If no loopback devices appear

- Install Python dependencies including `soundcard`:  
  `pip install -r fastapi-backend/requirements.txt`
- Restart the app after granting microphone permission.
- As a fallback, use a physical input device or BlackHole only if you already use it for routing.

## Development on macOS

```bash
# Python ML backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r fastapi-backend/requirements.txt

# Electron + React
cd electron-app && npm install
cd react-frontend && npm install
cd ../..

# Run (starts React dev server + Electron + ML service)
python3 start_electron.py
# or:
./scripts/start_app.sh
```

### Build a macOS DMG (on a Mac)

```bash
pip install pyinstaller
python3 build_electron.py --platform mac
```

Artifacts are copied to `./dist/`. Code signing and notarization are optional; set `CSC_*` env vars for distribution outside your machine.

## Known limitations on macOS

- **Outgoing voice to teammates** (virtual microphone into the game) is less mature than on Windows; incoming subtitles and translation work with loopback capture.
- Overlay click-through behavior matches Windows; adjust display scaling if subtitles are misplaced.
- PyInstaller bundle must be built **on macOS** (cannot cross-compile the ML service from Windows).

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| App won’t open | Privacy & Security → Open Anyway; ensure arm64 vs Intel build matches your Mac |
| No audio / RMS = 0 | Select a **[Loopback]** device; check system volume; retry after mic permission |
| ML service won’t start | See `~/Library/Application Support/Electron/ml-service.log` (dev) or app userData logs |
| High latency | Use Whisper `tiny` or `base` model in settings |

For more help, see [AUDIO_DEVICE_GUIDE.md](AUDIO_DEVICE_GUIDE.md) and [SOLUTIONS.md](SOLUTIONS.md).
