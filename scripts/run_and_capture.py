"""
Run app and capture all output/errors to console
"""
import sys
import os
import traceback

# Ensure we can see all output
sys.stdout.reconfigure(encoding='utf-8', errors='replace') if hasattr(sys.stdout, 'reconfigure') else None
sys.stderr.reconfigure(encoding='utf-8', errors='replace') if hasattr(sys.stderr, 'reconfigure') else None

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("=" * 70)
print("RUNNING APPLICATION WITH FULL ERROR CAPTURE")
print("=" * 70)
print(f"Python: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print("=" * 70)
print()
sys.stdout.flush()

try:
    print("[1/7] Setting up encoding...")
    sys.stdout.flush()
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    safe_print("   [OK] Encoding setup complete")
    sys.stdout.flush()
    
    print("\n[2/7] Importing tkinter...")
    sys.stdout.flush()
    import tkinter as tk
    safe_print("   [OK] Tkinter imported")
    sys.stdout.flush()
    
    print("\n[3/7] Creating root window...")
    sys.stdout.flush()
    root = tk.Tk()
    root.title("CS:GO 2 Translation")
    root.geometry("720x900+100+100")
    safe_print("   [OK] Root window created")
    sys.stdout.flush()
    
    print("\n[4/7] Importing TranslationApp...")
    sys.stdout.flush()
    from ui.main_window import TranslationApp
    safe_print("   [OK] TranslationApp imported")
    sys.stdout.flush()
    
    print("\n[5/7] Creating TranslationApp instance...")
    print("   (This may take a moment - initializing components...)")
    sys.stdout.flush()
    try:
        app = TranslationApp(root)
        safe_print("   [OK] TranslationApp created successfully")
        sys.stdout.flush()
    except Exception as e:
        safe_print(f"   [ERROR] Creating TranslationApp: {type(e).__name__}: {e}")
        print("   Full traceback:")
        traceback.print_exc()
        sys.stdout.flush()
        raise
    
    print("\n[6/7] Setting up window...")
    sys.stdout.flush()
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.deiconify()
    root.lift()
    root.focus_force()
    root.update()
    safe_print("   [OK] Window setup complete")
    sys.stdout.flush()
    
    print("\n[7/7] Starting mainloop...")
    print("=" * 70)
    print("APPLICATION READY - Window should be visible now!")
    print("Mainloop starting - Python will stay running...")
    print("=" * 70)
    print()
    sys.stdout.flush()
    
    root.mainloop()
    
    print("\nMainloop exited - application closed")
    
except KeyboardInterrupt:
    print("\n\nApplication interrupted by user (Ctrl+C)")
except Exception as e:
    print(f"\n\n{'='*70}")
    print(f"CRITICAL ERROR: {type(e).__name__}: {e}")
    print(f"{'='*70}")
    print("Full traceback:")
    traceback.print_exc()
    print(f"{'='*70}")
    print("\nPress Enter to exit...")
    input()
