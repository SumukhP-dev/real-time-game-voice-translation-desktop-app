# Audio File Conversion Scripts

These scripts automatically convert raw `.f32pcm` audio files captured by the app into MP4 format.

## Files

- **`batch_convert_audio_to_mp4.py`** - Convert all existing `.f32pcm` files at once (recommended)
- **`convert_audio_to_mp4.py`** - Watch for new files and convert them automatically (requires `watchdog`)

## Prerequisites

1. **ffmpeg** - Required for MP4 conversion
   - Windows: Download from https://ffmpeg.org/download.html or use `winget install ffmpeg`
   - Make sure `ffmpeg` is in your PATH

2. **Python packages** (optional but recommended):
   ```bash
   pip install soundfile numpy
   ```
   - `soundfile` makes conversion faster
   - `numpy` is required for audio processing

3. **For auto-watching** (optional):
   ```bash
   pip install watchdog
   ```

## Usage

### Batch Conversion (Recommended)

Convert all existing `.f32pcm` files at once:

```bash
cd scripts
python batch_convert_audio_to_mp4.py
```

This will:
- Find all `.f32pcm` files in `tauri-app/audio_captures/`
- Convert them to MP4 files
- Save MP4 files to `tauri-app/audio_captures/mp4_output/`

### Auto-Watching (Optional)

Watch for new files and convert them automatically:

```bash
cd scripts
python convert_audio_to_mp4.py
```

This will:
- Convert all existing files on startup
- Watch for new `.f32pcm` files
- Automatically convert them as they appear
- Press Ctrl+C to stop

## Output

- **Input**: `tauri-app/audio_captures/capture_*.f32pcm`
- **Output**: `tauri-app/audio_captures/mp4_output/capture_*.mp4`

MP4 files use AAC audio codec at 192kbps bitrate.

## Troubleshooting

### "ffmpeg not found"
- Install ffmpeg and make sure it's in your PATH
- Test with: `ffmpeg -version`

### "soundfile not installed"
- This is optional - the script will use ffmpeg directly (slower)
- Install with: `pip install soundfile`

### Empty or corrupted files
- Make sure the `.f32pcm` file was fully written before conversion
- Check file size - empty files will be skipped

