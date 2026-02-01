"""
Diagnostic script to detect USB headphones and diagnose subtitle issues
"""
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

try:
    import sounddevice as sd
    import json
except ImportError as e:
    print(f"Error: Missing required library: {e}")
    print("Please install: pip install sounddevice")
    sys.exit(1)

print("="*80)
print("AUDIO DEVICE & SUBTITLE DIAGNOSTIC")
print("="*80)

# List all audio devices
print("\n" + "="*80)
print("ALL AUDIO DEVICES:")
print("="*80)

devices = sd.query_devices()
input_devices = []
output_devices = []
usb_devices = []

for i, device in enumerate(devices):
    name = device['name'].lower()
    is_usb = any(keyword in name for keyword in ['usb', 'headset', 'headphone', 'headphone'])
    
    device_info = {
        'index': i,
        'name': device['name'],
        'max_input_channels': device['max_input_channels'],
        'max_output_channels': device['max_output_channels'],
        'default_samplerate': device['default_samplerate'],
        'hostapi': device['hostapi']
    }
    
    if device['max_input_channels'] > 0:
        input_devices.append(device_info)
        if is_usb:
            usb_devices.append(device_info)
    
    if device['max_output_channels'] > 0:
        output_devices.append(device_info)
        if is_usb:
            usb_devices.append(device_info)

print("\nINPUT DEVICES (for audio capture):")
print("-"*80)
for dev in input_devices:
    usb_marker = " [USB/HEADPHONE]" if dev in usb_devices else ""
    print(f"  [{dev['index']:2d}] {dev['name']}{usb_marker}")
    print(f"      Channels: {dev['max_input_channels']}, Sample Rate: {int(dev['default_samplerate'])}Hz")

print("\nOUTPUT DEVICES (for playback):")
print("-"*80)
for dev in output_devices:
    usb_marker = " [USB/HEADPHONE]" if dev in usb_devices else ""
    print(f"  [{dev['index']:2d}] {dev['name']}{usb_marker}")
    print(f"      Channels: {dev['max_output_channels']}, Sample Rate: {int(dev['default_samplerate'])}Hz")

# Check for USB headphones specifically
print("\n" + "="*80)
print("USB HEADPHONE DETECTION:")
print("="*80)

if usb_devices:
    print(f"✓ Found {len(usb_devices)} USB/headphone device(s):")
    for dev in usb_devices:
        device_type = "INPUT" if dev['max_input_channels'] > 0 else "OUTPUT"
        print(f"  - [{dev['index']}] {dev['name']} ({device_type})")
else:
    print("✗ No USB/headphone devices detected")
    print("  Note: Detection is based on keywords: 'usb', 'headset', 'headphone'")
    print("  If your device has a different name, it may not be detected automatically")

# Check for CABLE Output (for game audio capture)
print("\n" + "="*80)
print("VB-AUDIO CABLE CHECK:")
print("="*80)

cable_output = None
cable_input = None

for dev in input_devices:
    if 'cable' in dev['name'].lower() and 'output' in dev['name'].lower():
        cable_output = dev
        break

for dev in output_devices:
    if 'cable' in dev['name'].lower() and 'input' in dev['name'].lower():
        cable_input = dev
        break

if cable_output:
    print(f"✓ CABLE Output found: [{cable_output['index']}] {cable_output['name']}")
    print("  → This is the device the app should use to capture game audio")
else:
    print("✗ CABLE Output NOT FOUND")
    print("  → Install VB-Audio Virtual Cable for game audio capture")
    print("  → Download: https://vb-audio.com/Cable/")

if cable_input:
    print(f"✓ CABLE Input found: [{cable_input['index']}] {cable_input['name']}")
else:
    print("✗ CABLE Input NOT FOUND")

# Check default devices
print("\n" + "="*80)
print("DEFAULT DEVICES:")
print("="*80)

try:
    default_input = sd.query_devices(kind='input')
    print(f"Default Input: [{default_input['index']}] {default_input['name']}")
except:
    print("Could not determine default input device")

try:
    default_output = sd.query_devices(kind='output')
    print(f"Default Output: [{default_output['index']}] {default_output['name']}")
except:
    print("Could not determine default output device")

# Subtitle/Overlay diagnostics
print("\n" + "="*80)
print("SUBTITLE/OVERLAY DIAGNOSTICS:")
print("="*80)

print("\nCommon reasons subtitles might not work:")
print("1. Overlay window not enabled in settings")
print("2. Source language equals target language (and 'Show Same Language' is disabled)")
print("3. Overlay window is positioned off-screen")
print("4. Overlay window is hidden behind other windows")
print("5. Audio capture is not working (no audio = no transcription = no subtitles)")
print("6. Translation service is not running (port 8000)")
print("7. ML service connection failed")

print("\n" + "="*80)
print("RECOMMENDATIONS:")
print("="*80)

if not cable_output:
    print("\n1. For game audio capture:")
    print("   → Install VB-Audio Virtual Cable")
    print("   → Set CABLE Input as default playback device")
    print("   → Enable 'Listen to this device' on CABLE Output")
    print("   → Select your USB headphones in the 'Listen' dropdown")

if usb_devices:
    print("\n2. Your USB headphones are detected:")
    for dev in usb_devices:
        if dev['max_output_channels'] > 0:
            print(f"   → Use '{dev['name']}' for audio playback")

print("\n3. To fix subtitles:")
print("   → Check Translation Settings: 'Enable Text Overlay' should be ON")
print("   → If source = target language, enable 'Show Subtitles for Same Language'")
print("   → Make sure audio capture is working (check status in app)")
print("   → Verify ML service is running on port 8000")
print("   → Check browser console for errors (F12 in the app)")

print("\n" + "="*80)
print("TESTING AUDIO CAPTURE:")
print("="*80)

if cable_output:
    print(f"\nTry capturing from device [{cable_output['index']}]: {cable_output['name']}")
    print("In the app, select this device in Audio Settings")
elif input_devices:
    print(f"\nTry capturing from device [{input_devices[0]['index']}]: {input_devices[0]['name']}")
    print("In the app, select this device in Audio Settings")
else:
    print("\n✗ No input devices found!")

print("\n" + "="*80)

