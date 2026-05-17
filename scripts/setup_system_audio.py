"""
Check for WASAPI loopback capture devices and print setup instructions.
"""
import sys


def check_wasapi_loopback():
    """List capture devices and highlight WASAPI loopback entries."""
    try:
        from pathlib import Path

        sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "fastapi-backend"))
        from audio_capture import list_capture_devices  # type: ignore
    except ImportError as e:
        print(f"Could not import audio_capture: {e}")
        return

    print("Checking for WASAPI loopback capture devices...")
    devices = list_capture_devices()
    loopback = [d for d in devices if "loopback" in d.get("name", "").lower()]

    if not devices:
        print("✗ No audio devices reported by the backend.")
        return

    for d in devices:
        marker = "  ← WASAPI loopback" if d in loopback else ""
        print(f"  [{d['index']}] {d['name']}{marker}")

    if loopback:
        print("\n✓ WASAPI loopback device(s) found. Select one in the app Audio Settings.")
        print("  1. Start the translation app")
        print("  2. Choose your headphones/speakers (WASAPI loopback)")
        print("  3. Click Start Capture and play game or system audio")
    else:
        print("\n✗ No WASAPI loopback devices found.")
        print("  • Run the app on Windows 10/11 with the ML service started")
        print("  • Or enable Stereo Mix in Windows Sound → Recording")


if __name__ == "__main__":
    check_wasapi_loopback()
