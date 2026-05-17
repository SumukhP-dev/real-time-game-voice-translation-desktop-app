"""List capture devices and highlight WASAPI loopback (use app status logs for RMS)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "fastapi-backend"))

from audio_capture import list_capture_devices, wasapi_loopback_supported  # noqa: E402

print("WASAPI loopback routing check")
print("=" * 50)
print(f"WASAPI loopback supported: {wasapi_loopback_supported()}\n")

devices = list_capture_devices()
for d in devices:
    tag = " ← use for game audio" if "loopback" in d.get("name", "").lower() else ""
    print(f"  [{d['index']}] {d['name']}{tag}")

print("\nTo verify levels: start capture in the app, play audio, and check Status Logs for RMS.")
