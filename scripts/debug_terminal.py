"""
Debug script to test terminal output and error handling
"""
import sys
import traceback

print("=" * 60)
print("DEBUG: Testing terminal output and error handling")
print("=" * 60)

# Test imports
print("\n1. Testing imports...")
try:
    import sounddevice as sd
    print("   ✓ sounddevice imported successfully")
except ImportError as e:
    print(f"   ❌ sounddevice import failed: {e}")
    traceback.print_exc()

try:
    import whisper
    print("   ✓ whisper imported successfully")
except ImportError as e:
    print(f"   ❌ whisper import failed: {e}")
    traceback.print_exc()

try:
    from audio_capture_wasapi_free import AudioCapture
    print("   ✓ AudioCapture imported successfully")
except Exception as e:
    print(f"   ❌ AudioCapture import failed: {e}")
    traceback.print_exc()

try:
    from speech_recognition import SpeechRecognizer
    print("   ✓ SpeechRecognizer imported successfully")
except Exception as e:
    print(f"   ❌ SpeechRecognizer import failed: {e}")
    traceback.print_exc()

# Test audio device listing
print("\n2. Testing audio device listing...")
try:
    capture = AudioCapture()
    devices = capture.list_audio_devices()
    print(f"   ✓ Found {len(devices)} audio devices")
    for i, device in enumerate(devices[:3]):  # Show first 3
        print(f"      [{i}] {device['name']}")
    capture.cleanup()
except Exception as e:
    print(f"   ❌ Audio device listing failed: {e}")
    traceback.print_exc()

# Test main app import
print("\n3. Testing main app import...")
try:
    import main_tkinter_free
    print("   ✓ main_tkinter_free imported successfully")
except Exception as e:
    print(f"   ❌ main_tkinter_free import failed: {e}")
    traceback.print_exc()

print("\n" + "=" * 60)
print("DEBUG: All tests completed")
print("=" * 60)
print("\nIf you see any ❌ errors above, those need to be fixed.")
print("If all tests passed, the app should work correctly.")

