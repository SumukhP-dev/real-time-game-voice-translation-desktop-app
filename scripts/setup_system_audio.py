"""
Helper script to check for VB-Audio Virtual Cable and provide setup instructions
"""
import sys

def check_virtual_cable():
    """Check if VB-Audio Virtual Cable is available"""
    try:
        import sounddevice as sd
        devices = sd.query_devices()
        
        print("Checking for VB-Audio Virtual Cable...")
        print("=" * 60)
        
        found_cable = False
        for i, device in enumerate(devices):
            name_lower = device['name'].lower()
            if 'cable' in name_lower or 'virtual' in name_lower:
                if device['max_input_channels'] > 0:
                    print(f"✓ FOUND: {device['name']} (Index: {i})")
                    print(f"   Max input channels: {device['max_input_channels']}")
                    print(f"   Sample rate: {device['default_samplerate']}Hz")
                    found_cable = True
        
        if not found_cable:
            print("✗ VB-Audio Virtual Cable NOT FOUND")
            print("\nTo install:")
            print("1. Download: https://vb-audio.com/Cable/")
            print("2. Install the software")
            print("3. Restart this application")
            print("4. Select 'CABLE Input' as your audio device")
            return False
        else:
            print("\n✓ Virtual Cable is available!")
            print("To use it:")
            print("1. Set 'CABLE Input' as default playback device in Windows")
            print("2. Route your game/system audio to CABLE Input")
            print("3. Select 'CABLE Input' in the translation app")
            return True
            
    except Exception as e:
        print(f"Error checking devices: {e}")
        return False

if __name__ == "__main__":
    check_virtual_cable()

