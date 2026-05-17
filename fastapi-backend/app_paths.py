"""Persistent paths for dev and PyInstaller-packaged runs."""
import os
import sys
from pathlib import Path


def get_app_data_dir() -> Path:
    if getattr(sys, "frozen", False):
        root = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "RealTimeVoiceTranslation"
    else:
        root = Path(__file__).resolve().parent.parent
    root.mkdir(parents=True, exist_ok=True)
    return root


def get_models_dir() -> Path:
    models = get_app_data_dir() / "models"
    models.mkdir(parents=True, exist_ok=True)
    return models
