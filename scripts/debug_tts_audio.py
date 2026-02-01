"""
Comprehensive TTS and Windows Audio Debug Script
"""
import sys
import os
import time

# Add src to path
src_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

print("=" * 80)
print("COMPREHENSIVE TTS AUDIO DEBUG")
print("=" * 80)
print()

# Check Windows audio
if sys.platform == 'win32':
    print("Windows Audio Check:")
    print("-" * 80)
    try:
        import ctypes
        from ctypes import wintypes
        
        # Check if audio is muted
        try:
            # Try to get volume using Windows API
            print("  Checking Windows audio settings...")
            
            # Get default audio endpoint
            try:
                import comtypes.client
                from comtypes import CLSCTX_ALL
                
                # Try to use Windows Core Audio API
                print("  Attempting to access Windows Core Audio API...")
                # This is complex, so let's just check if we can get volume info
            except:
                pass
            
            print("  Note: Full audio device check requires Windows API access")
            print("  Please manually check:")
            print("    1. Right-click speaker icon in system tray")
            print("    2. Check if volume is muted")
            print("    3. Check which device is set as default playback")
            print("    4. Try playing a YouTube video to test audio output")
            
        except Exception as e:
            print(f"  Could not check Windows audio: {e}")
    except Exception as e:
        print(f"  Error checking Windows audio: {e}")

print()
print("=" * 80)
print("Testing TTS with Multiple Approaches")
print("=" * 80)
print()

# Test 1: Direct pyttsx3 test
print("Test 1: Direct pyttsx3 (simple)")
print("-" * 80)
try:
    import pyttsx3
    engine1 = pyttsx3.init('sapi5')
    engine1.setProperty('volume', 1.0)
    engine1.setProperty('rate', 150)
    print("  Speaking: 'Direct test one'")
    engine1.say("Direct test one")
    engine1.runAndWait()
    print("  ✓ Completed")
    print("  Did you hear 'Direct test one'?")
    time.sleep(0.5)
except Exception as e:
    print(f"  ✗ Error: {e}")

print()

# Test 2: Direct pyttsx3 with different voice
print("Test 2: Direct pyttsx3 (different voice)")
print("-" * 80)
try:
    engine2 = pyttsx3.init('sapi5')
    engine2.setProperty('volume', 1.0)
    engine2.setProperty('rate', 150)
    
    # Try to use Zira voice
    voices = engine2.getProperty('voices')
    for voice in voices:
        if 'zira' in voice.name.lower():
            engine2.setProperty('voice', voice.id)
            print(f"  Using voice: {voice.name}")
            break
    
    print("  Speaking: 'Direct test two'")
    engine2.say("Direct test two")
    engine2.runAndWait()
    print("  ✓ Completed")
    print("  Did you hear 'Direct test two'?")
    time.sleep(0.5)
except Exception as e:
    print(f"  ✗ Error: {e}")

print()

# Test 3: Test with actual TTS class
print("Test 3: TextToSpeech class (with queue)")
print("-" * 80)
try:
    from core.tts.engine import TextToSpeech
    from config.manager import config
    
    # Force enable
    config.set("tts", "enabled", value=True)
    config.save()
    
    tts = TextToSpeech()
    print(f"  TTS created - enabled: {tts.is_enabled}, engine: {tts.engine is not None}")
    
    if tts.is_enabled and tts.engine:
        tts.enable()
        print("  Speaking: 'Class test three'")
        tts.speak("Class test three")
        
        # Wait for it to complete
        time.sleep(3)
        print("  ✓ Completed")
        print("  Did you hear 'Class test three'?")
    else:
        print("  ✗ TTS not enabled or engine is None")
        
except Exception as e:
    print(f"  ✗ Error: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 80)
print("DIAGNOSIS")
print("=" * 80)
print()
print("If you didn't hear ANY of the test phrases:")
print("  1. Check Windows system volume (not muted)")
print("  2. Check Windows default playback device")
print("  3. Try playing a YouTube video to verify audio works")
print("  4. Check if audio is going to headphones vs speakers")
print()
print("If you heard SOME but not ALL:")
print("  - The working test shows which method works")
print("  - The non-working test shows what needs fixing")
print()
print("If you heard ALL:")
print("  - TTS is working! The issue might be in the app's integration")
print()

input("Press Enter to exit...")

