"""
Quick script to help fix headphone audio routing
"""
import sounddevice as sd

print("="*70)
print("FIX HEADPHONE AUDIO ROUTING")
print("="*70)

# List all playback devices (for Listen to this device)
print("\nAvailable Playback Devices (for 'Listen to this device'):")
print("-"*70)

playback_devices = []
for i, device in enumerate(sd.query_devices()):
    if device['max_output_channels'] > 0:
        name = device['name']
        playback_devices.append((i, name))
        print(f"Index {i:2d}: {name}")

print("\n" + "="*70)
print("STEP-BY-STEP FIX:")
print("="*70)
print("\n1. Open Windows Sound Settings:")
print("   → Right-click speaker icon → 'Sounds'")
print("   → OR: Press Win+R, type 'mmsys.cpl', press Enter")
print("\n2. Go to Recording Tab:")
print("   → Click 'Recording' tab at top")
print("\n3. Find CABLE Output:")
print("   → Look for 'CABLE Output (VB-Audio Virtual Cable)'")
print("   → Right-click → 'Properties'")
print("\n4. Go to Listen Tab:")
print("   → Click 'Listen' tab")
print("   → ✅ CHECK 'Listen to this device'")
print("\n5. Select Your Headphones:")
print("   → In dropdown 'Playback through this device'")
print("   → Select one of these (try each if first doesn't work):")
for idx, name in playback_devices:
    if 'bose' in name.lower() or 'headset' in name.lower() or 'headphone' in name.lower():
        print(f"      → '{name}' (Index: {idx}) ← TRY THIS FIRST")
print("   → If none of those work, try:")
for idx, name in playback_devices[:5]:  # Show first 5 as alternatives
    print(f"      → '{name}' (Index: {idx})")
print("\n6. Apply Settings:")
print("   → Click 'Apply'")
print("   → Click 'OK'")
print("\n7. Test:")
print("   → Play a YouTube video")
print("   → You should hear it through headphones!")
print("\n" + "="*70)
print("TROUBLESHOOTING:")
print("="*70)
print("\nIf you still can't hear audio:")
print("1. Make sure CABLE Input is set as Default Playback Device")
print("   → Playback tab → CABLE Input → Set as Default")
print("\n2. Try different headphones in the Listen dropdown")
print("   → Some devices might not work, try others")
print("\n3. Check Windows Volume:")
print("   → Make sure system volume is up")
print("   → Check Volume Mixer (right-click speaker → Volume mixer)")
print("\n4. Restart the app after changing settings")
print("="*70)

