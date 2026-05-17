"""Quick diagnostic: list WASAPI loopback and other capture devices."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "fastapi-backend"))

from audio_capture import list_capture_devices  # noqa: E402

print("WASAPI LOOPBACK SETUP CHECK")
print("=" * 50)

devices = list_capture_devices()
if not devices:
    print("No devices returned. Is the ML service / soundcard backend available?")
    raise SystemExit(1)

loopback = []
for d in devices:
    name = d.get("name", "")
    is_loopback = "loopback" in name.lower()
    if is_loopback:
        loopback.append(d)
        print(f"  [{d['index']}] {name}  ← WASAPI loopback")
    else:
        print(f"  [{d['index']}] {name}")

print()
if loopback:
    print(f"✓ Found {len(loopback)} WASAPI loopback device(s). Use one in the app Audio Settings.")
else:
    print("✗ No WASAPI loopback devices listed.")
    print("  Run on Windows 10/11 with headphones/speakers connected, or enable Stereo Mix.")

print("\nNext steps:")
print("  1. Open the app → Audio Settings")
print("  2. Select your headphones/speakers (WASAPI loopback)")
print("  3. Start Capture and play audio")
