# Voice Cloning Setup Guide

## Requirements

Voice cloning requires specific Python versions and dependencies.

### Python Version

- **Required**: Python 3.9, 3.10, or 3.11
- **Not supported**: Python 3.8 or lower, Python 3.12 or higher

The TTS library (Coqui TTS) has strict Python version requirements.

### Dependencies

- `TTS>=0.20.0` - Coqui Text-to-Speech library
- `torch>=2.0.0` - PyTorch for deep learning
- `torchaudio>=2.0.0` - Audio processing for PyTorch

## Installation

### Option 1: Using Compatible Python Version (Recommended)

1. **Check your Python version:**

   ```bash
   python --version
   ```

2. **If you have Python 3.12 or higher:**

   - Install Python 3.11 from [python.org](https://www.python.org/downloads/)
   - Create a new virtual environment with Python 3.11:
     ```bash
     py -3.11 -m venv .venv311
     .venv311\Scripts\activate
     ```

3. **Install dependencies:**
   ```bash
   pip install TTS torch torchaudio
   ```

### Option 2: Manual Installation

If you're using Python 3.12+, you can try installing from source (advanced):

```bash
pip install git+https://github.com/coqui-ai/TTS.git
```

**Note**: This may have compatibility issues and is not officially supported.

### Option 3: Use Alternative TTS (No Voice Cloning)

If voice cloning is not essential, the app works fine with the built-in TTS engines:

- `pyttsx3` - System TTS (works on all Python versions)
- `gTTS` - Google Text-to-Speech (works on all Python versions)

These don't support voice cloning but provide good quality TTS.

## Verification

After installation, verify voice cloning is available:

1. Open the app
2. Go to **Integrations** dialog
3. Check **Voice Cloning** section
4. Status should show "Available"
5. Click "Initialize Voice Cloning" to test

## Troubleshooting

### Error: "No matching distribution found for TTS"

**Cause**: Python version incompatible

**Solution**:

- Use Python 3.9, 3.10, or 3.11
- Create a new virtual environment with compatible Python version

### Error: "TTS library is installed but not working"

**Possible causes**:

1. Model download failed (needs internet connection)
2. GPU/CUDA issues
3. Missing dependencies

**Solutions**:

1. Check internet connection for first-time model download
2. Install CUDA toolkit if using GPU (optional)
3. Reinstall: `pip uninstall TTS && pip install TTS`

### Error: "ImportError: cannot import name 'TTS'"

**Cause**: TTS not properly installed

**Solution**:

```bash
pip uninstall TTS
pip install TTS --no-cache-dir
```

## Using Voice Cloning

1. **Initialize**: Click "Initialize Voice Cloning" in Integrations dialog
2. **Clone a voice**:
   - Record or provide an audio sample (WAV format recommended)
   - Use the voice cloning API to clone the voice
3. **Synthesize**: Use cloned voice for TTS output

## Alternative: System TTS

If voice cloning setup is too complex, the app's built-in TTS works great:

- **pyttsx3**: Uses your system's native TTS voices
- **gTTS**: Google's cloud-based TTS (requires internet)

Both are automatically available and don't require special setup.
