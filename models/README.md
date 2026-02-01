# Models Directory

This directory contains locally stored AI models used by the application.

## Whisper Models

Whisper speech recognition models are stored in `whisper/` subdirectory.

### Available Models

- **tiny**: Fastest, least accurate (~39 MB)
- **base**: Good balance of speed and accuracy (~74 MB)
- **small**: Better accuracy, still fast (~244 MB) - **Recommended**
- **medium**: High accuracy, slower (~769 MB)
- **large**: Best accuracy, slowest (~1550 MB)

### Downloading Models

To download a model, run:

```bash
python scripts/download_whisper_model.py <model_name>
```

For example:
```bash
python scripts/download_whisper_model.py small
```

### Model Location

Models are stored in: `models/whisper/<model_name>/<model_name>.pt`

The application will automatically:
1. Check for models in this local directory first
2. If not found, download and cache the model
3. Copy the cached model to this directory for future use

### Benefits

- **Faster startup**: Models are pre-downloaded and ready to use
- **Offline use**: Models work without internet connection after download
- **Version control**: Models can be committed to version control (if desired)
- **Portable**: Models travel with the project

### Note

Model files can be large (especially `medium` and `large`). Consider adding them to `.gitignore` if you don't want to commit them to version control.

