"""Persistent paths for dev and PyInstaller-packaged runs."""
import os
import sys
from pathlib import Path


def get_app_data_dir() -> Path:
    if getattr(sys, "frozen", False):
        if sys.platform == "darwin":
            root = Path.home() / "Library" / "Application Support" / "RealTimeVoiceTranslation"
        elif sys.platform == "win32":
            root = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "RealTimeVoiceTranslation"
        else:
            root = Path.home() / ".local" / "share" / "RealTimeVoiceTranslation"
    else:
        root = Path(__file__).resolve().parent.parent
    root.mkdir(parents=True, exist_ok=True)
    return root


def get_models_dir() -> Path:
    models = get_app_data_dir() / "models"
    models.mkdir(parents=True, exist_ok=True)
    return models
