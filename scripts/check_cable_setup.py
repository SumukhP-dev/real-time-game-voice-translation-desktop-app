"""
Quick diagnostic script to check VB-Audio Virtual Cable setup
"""
import sounddevice as sd

print("="*70)
print("VB-AUDIO VIRTUAL CABLE SETUP CHECK")
print("="*70)

# List all devices
devices = sd.query_devices()
print("\nAll Input (Recording) Devices:")
print("-"*70)

cable_output_found = False
cable_input_found = False

for i, device in enumerate(devices):
    if device['max_input_channels'] > 0:
        name = device['name']
        print(f"Index {i:2d}: {name}")
        
        name_lower = name.lower()
        if 'cable' in name_lower and 'output' in name_lower:
            cable_output_found = True
            print(f"        ^^^^ CABLE OUTPUT FOUND (Recording Device) ^^^^")
        elif 'cable' in name_lower and 'input' in name_lower:
            cable_input_found = True
            print(f"        ^^^^ CABLE INPUT FOUND (Playback Device) ^^^^")

print("\n" + "="*70)
print("SETUP CHECKLIST:")
print("="*70)

if cable_output_found:
    print("✓ CABLE Output found (recording device - this is what the app should use)")
else:
    print("✗ CABLE Output NOT FOUND")
    print("  → Make sure VB-Audio Virtual Cable is installed")
    print("  → Restart your computer after installation")

if cable_input_found:
    print("✓ CABLE Input found (playback device)")
else:
    print("✗ CABLE Input NOT FOUND")
    print("  → Make sure VB-Audio Virtual Cable is installed")

print("\n" + "="*70)
print("WINDOWS SETTINGS CHECK:")
print("="*70)
print("1. Open Windows Sound settings (right-click speaker icon → Sounds)")
print("2. Playback tab:")
print("   → Is 'CABLE Input' set as Default Device? (should have green checkmark)")
print("3. Recording tab:")
print("   → Find 'CABLE Output' → Right-click → Properties")
print("   → Listen tab:")
print("     → Is 'Listen to this device' CHECKED?")
print("     → Is your headphones selected in dropdown?")
print("="*70)

if cable_output_found and cable_input_found:
    print("\n✓ Both devices found! Setup should work.")
    print("  Make sure Windows settings are configured as shown above.")
else:
    print("\n⚠ Some devices missing. Check installation and restart computer.")

