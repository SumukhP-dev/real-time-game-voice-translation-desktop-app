"""
Quick script to check available audio devices and find Stereo Mix
"""
import pyaudio

p = pyaudio.PyAudio()

print("=" * 70)
print("CHECKING FOR STEREO MIX")
print("=" * 70)

print("\nAll Input Devices:")
print("-" * 70)
stereo_mix_found = False
stereo_mix_index = None

for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    if info['maxInputChannels'] > 0:
        name = info['name']
        print(f"Index {i:2d}: {name}")
        if 'stereo mix' in name.lower():
            stereo_mix_found = True
            stereo_mix_index = i
            print(f"        ^^^^ STEREO MIX FOUND! ^^^^")

print("\n" + "=" * 70)
if stereo_mix_found:
    print(f"✓ Stereo Mix is AVAILABLE at Index {stereo_mix_index}")
    print("  It should appear in the application dropdown")
else:
    print("✗ Stereo Mix is NOT FOUND in the device list")
    print("\nTo enable Stereo Mix:")
    print("1. Right-click speaker icon in system tray")
    print("2. Select 'Sounds' → 'Recording' tab")
    print("3. Right-click empty space → 'Show Disabled Devices'")
    print("4. Find 'Stereo Mix' → Right-click → 'Enable'")
    print("5. Restart the application")

print("=" * 70)
p.terminate()

