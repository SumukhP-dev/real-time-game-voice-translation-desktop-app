"""
Debug script to run the app and capture TTS debug output
"""
import sys
import os

# Ensure we're in the right directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Redirect stderr to stdout to capture all output
sys.stderr = sys.stdout

print("=" * 80)
print("TTS DEBUG MODE - All output will be shown here")
print("=" * 80)
print()
print("Looking for TTS-related messages...")
print("Filter: [TTS]")
print("-" * 80)
print()

# Filter to show TTS messages prominently
class TTSFilter:
    def __init__(self, original):
        self.original = original
        self.buffer = ""
    
    def write(self, text):
        self.buffer += text
        if '\n' in self.buffer:
            lines = self.buffer.split('\n')
            self.buffer = lines[-1]
            for line in lines[:-1]:
                if '[TTS]' in line or 'TTS' in line.upper() or 'tts' in line.lower():
                    # Highlight TTS messages
                    print(f"\033[93m{line}\033[0m")  # Yellow color
                else:
                    print(line)
        self.original.write(text)
    
    def flush(self):
        self.original.flush()

# Apply filter on Windows (PowerShell/CMD)
if sys.platform == 'win32':
    # On Windows, just print everything
    pass

try:
    # Import and run the main app
    print("Starting application...")
    print("-" * 80)
    print()
    
    from main_tkinter import main
    
    print("Application started. Watch for [TTS] messages below.")
    print("=" * 80)
    print()
    
    main()
    
except KeyboardInterrupt:
    print("\n" + "=" * 80)
    print("Application interrupted by user (Ctrl+C)")
    print("=" * 80)
except Exception as e:
    print("\n" + "=" * 80)
    print(f"ERROR: {e}")
    print("=" * 80)
    import traceback
    traceback.print_exc()
    print("=" * 80)
    input("\nPress Enter to exit...")

