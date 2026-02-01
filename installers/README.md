# VB-Audio Virtual Cable Installers

This directory contains bundled installer files for VB-Audio Virtual Cable. If these files are present, the application will use them instead of downloading from the internet.

## Supported Files

### Windows
Place one of these files in this directory:
- `VBCABLE_Driver_Pack43.zip` (recommended)
- `VBCABLE_Setup.exe`
- `vb-audio-cable.zip`
- `vb_audio_cable.zip`

### macOS
Place one of these files in this directory:
- `VBCable_MACDriver_Pack107.dmg` (recommended)
- `VBCable_MACDriver.dmg`
- `vb-audio-cable.dmg`
- `vb_audio_cable.dmg`

## How to Get the Installers

1. **Windows:**
   - Visit: https://vb-audio.com/Cable/
   - Click "Download" for the Windows version
   - Download `VBCABLE_Driver_Pack43.zip`
   - Place it in this `installers/` directory

2. **macOS:**
   - Visit: https://vb-audio.com/Cable/
   - Click "Download" for the Mac version
   - Download `VBCable_MACDriver_Pack107.dmg`
   - Place it in this `installers/` directory

## Alternative Locations

The application will also check for installers in:
- `resources/installers/`
- `vb_audio_installers/`

## Benefits of Bundled Installers

- **Faster installation** - No download wait time
- **Offline support** - Works without internet connection
- **Reliability** - No dependency on external servers
- **Version control** - You control which version is bundled

## Notes

- If no bundled installer is found, the application will automatically download from the official VB-Audio website
- The bundled installer takes priority over downloading
- Make sure to use the correct installer for your platform (Windows vs macOS)


