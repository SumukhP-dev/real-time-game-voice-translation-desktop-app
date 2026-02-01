"""
Run the app with enhanced TTS debugging
Captures all TTS-related output
"""
import sys
import os

# Ensure we're in the right directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Redirect stderr to stdout
sys.stderr = sys.stdout

print("=" * 80)
print("RUNNING APP WITH TTS DEBUG MODE")
print("=" * 80)
print()
print("All TTS messages will be shown below.")
print("Watch for [TTS] messages when translations come in.")
print()
print("=" * 80)
print()

try:
    from main_tkinter import main
    main()
except KeyboardInterrupt:
    print("\n" + "=" * 80)
    print("Application closed by user")
    print("=" * 80)
except Exception as e:
    print("\n" + "=" * 80)
    print(f"ERROR: {e}")
    print("=" * 80)
    import traceback
    traceback.print_exc()
    print("=" * 80)
    input("\nPress Enter to exit...")

