# Audio Recording Feature Guide

## Overview

The app now includes an audio recording feature that saves captured audio to WAV files. This helps you verify:
- Whether audio is being captured correctly
- What audio is being captured
- Audio quality for transcription

## How It Works

1. **Automatic Recording**: When translation starts, audio recording is automatically enabled (if `save_audio` is `true` in `config.json`)
2. **Rolling Buffer**: The app keeps the last 30 seconds of captured audio in memory
3. **Save on Stop**: When you click "Stop Translation", the audio is saved to a WAV file
4. **File Location**: Audio files are saved in the project directory as `captured_audio_YYYYMMDD_HHMMSS.wav`

## Configuration

In `config.json`, you can enable/disable audio recording:

```json
{
    "audio": {
        "save_audio": true  // Set to false to disable recording
    }
}
```

## Usage

1. **Start the app**: `python main_tkinter.py`
2. **Click "Start Translation"** - You'll see: "ℹ Audio recording enabled - will save to captured_audio_*.wav"
3. **Play audio** on your computer (YouTube video, music, game, etc.)
4. **Wait a few seconds** to capture audio
5. **Click "Stop Translation"** - You'll see: "✓ Audio saved to: [filepath]"
6. **Check the project folder** for `captured_audio_*.wav` files
7. **Play the WAV file** to verify what was captured

## What You'll See

### In the GUI Log:
- When starting: "ℹ Audio recording enabled - will save to captured_audio_*.wav"
- When stopping: "✓ Audio saved to: [filepath]"

### In Terminal:
- "[OK] Audio file saved: [filepath]"
- Duration and sample rate information

## Troubleshooting

### No audio file created?
- Make sure you clicked "Stop Translation" (audio saves when stopping)
- Check that `save_audio` is `true` in `config.json`
- Verify scipy is installed: `pip install scipy`

### Audio file is empty or too short?
- Make sure audio was actually playing when you started translation
- Check that the audio device is capturing correctly
- Verify audio levels in the debug output (RMS values)

### Audio file has noise but no speech?
- This is normal - the app captures ALL system audio, including background noise
- The false positive filter prevents transcribing noise as "Thank you"
- Real speech should appear in transcriptions if audio is being captured

## File Format

- **Format**: WAV (uncompressed)
- **Sample Rate**: Same as capture rate (usually 44100 Hz or 16000 Hz)
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit
- **Duration**: Up to 30 seconds (last 30 seconds before stopping)

## Example Workflow

1. Start translation
2. Play a YouTube video with speech in another language
3. Wait 10-15 seconds
4. Stop translation
5. Check `captured_audio_*.wav` - you should hear the YouTube audio
6. If you hear the audio, transcription should work
7. If transcription isn't working, check the logs for language detection issues

## Notes

- Audio files can be large (30 seconds ≈ 2-3 MB)
- Old files are not automatically deleted - clean them up manually
- Recording is disabled when `save_audio` is `false` to save memory
- The 30-second limit prevents huge files from long sessions

