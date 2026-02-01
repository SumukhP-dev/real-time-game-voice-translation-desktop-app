"""
Diagnostic script to check why audio routing isn't working
"""
import sounddevice as sd
import numpy as np
import time

print("="*70)
print("AUDIO ROUTING DIAGNOSTIC")
print("="*70)

# Find CABLE Output
print("\n1. Finding CABLE Output device...")
devices = sd.query_devices()
cable_output_index = None
cable_output_name = None

for i, device in enumerate(devices):
    if device['max_input_channels'] > 0:
        name_lower = device['name'].lower()
        if 'cable' in name_lower and 'output' in name_lower:
            cable_output_index = i
            cable_output_name = device['name']
            print(f"   ✓ Found: {device['name']} (Index: {i})")
            break

if cable_output_index is None:
    print("   ✗ CABLE Output NOT FOUND!")
    print("   → Make sure VB-Audio Virtual Cable is installed")
    exit(1)

# Test audio capture
print(f"\n2. Testing audio capture from {cable_output_name}...")
print("   → Starting 5-second audio capture test...")
print("   → Play some audio (YouTube video, music, etc.) NOW!")
print("   → We'll measure the audio levels...")

try:
    audio_samples = []
    sample_rate = 44100
    
    def audio_callback(indata, frames, time_info, status):
        if status:
            print(f"   ⚠ Audio status: {status}")
        # Get audio level
        audio_data = indata[:, 0] if indata.shape[1] > 1 else indata.flatten()
        rms = np.sqrt(np.mean(audio_data**2))
        max_val = np.max(np.abs(audio_data))
        audio_samples.append((rms, max_val))
    
    with sd.InputStream(
        device=cable_output_index,
        channels=1,
        samplerate=sample_rate,
        blocksize=4096,
        callback=audio_callback,
        dtype=np.float32
    ):
        time.sleep(5)  # Capture for 5 seconds
    
    # Analyze results
    if audio_samples:
        avg_rms = np.mean([s[0] for s in audio_samples])
        max_rms = np.max([s[0] for s in audio_samples])
        avg_max = np.mean([s[1] for s in audio_samples])
        
        print(f"\n3. Audio Level Analysis:")
        print(f"   Average RMS: {avg_rms:.6f}")
        print(f"   Maximum RMS: {max_rms:.6f}")
        print(f"   Average Peak: {avg_max:.6f}")
        
        # Determine if we're getting real audio or static
        if avg_rms < 0.001:
            print(f"\n   ✗ PROBLEM: Very low audio levels (almost silence)")
            print(f"   → CABLE Output is not receiving audio")
            print(f"   → Check: Is CABLE Input set as default playback device?")
            print(f"   → Check: Is audio actually playing?")
        elif avg_rms < 0.01 and max_rms < 0.1:
            print(f"\n   ⚠ WARNING: Low audio levels detected")
            print(f"   → Might be static/noise, not real audio")
            print(f"   → Check: Is CABLE Input set as default playback device?")
            print(f"   → Check: Is 'Listen to this device' enabled on CABLE Output?")
        elif avg_rms > 0.05:
            print(f"\n   ✓ GOOD: Strong audio signal detected!")
            print(f"   → CABLE Output is receiving audio")
            print(f"   → If you're still getting static in the app, check:")
            print(f"     - Audio processing/filtering settings")
            print(f"     - False positive filters might be too aggressive")
        else:
            print(f"\n   ⚠ MODERATE: Audio detected but levels are moderate")
            print(f"   → Might be working, but check Windows audio settings")
    else:
        print(f"\n   ✗ PROBLEM: No audio samples captured")
        print(f"   → Device might not be accessible")
    
except Exception as e:
    print(f"\n   ✗ ERROR: Failed to capture audio: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*70)
print("WINDOWS SETTINGS CHECKLIST:")
print("="*70)
print("1. CABLE Input set as Default Playback Device?")
print("   → Windows Sound → Playback tab → CABLE Input → Set as Default")
print("")
print("2. 'Listen to this device' enabled?")
print("   → Windows Sound → Recording tab → CABLE Output → Properties")
print("   → Listen tab → Check 'Listen to this device'")
print("   → Select your headphones in dropdown")
print("")
print("3. Is audio actually playing?")
print("   → Play a YouTube video or music")
print("   → You should hear it through headphones (via Listen)")
print("="*70)

