"""
Full debug of app startup with all exceptions caught
"""
import sys
import os
import traceback

# Redirect all output
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None
sys.stderr.reconfigure(encoding='utf-8') if hasattr(sys.stderr, 'reconfigure') else None

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("=" * 70)
print("FULL APP STARTUP DEBUG")
print("=" * 70)
print(f"Python: {sys.version}")
print(f"Working dir: {os.getcwd()}")
print()

try:
    print("Step 1: Importing safe_print...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    print("   ✓ OK")
    
    print("\nStep 2: Importing TranslationApp...")
    from ui.main_window import TranslationApp
    print("   ✓ OK")
    
    print("\nStep 3: Importing tkinter...")
    import tkinter as tk
    print("   ✓ OK")
    
    print("\nStep 4: Creating Tk root...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation - DEBUG MODE")
    print("   ✓ Root created")
    
    print("\nStep 5: Creating TranslationApp (this might take a moment)...")
    try:
        app = TranslationApp(root)
        print("   ✓ TranslationApp created")
    except Exception as e:
        print(f"   ✗ ERROR creating TranslationApp: {e}")
        traceback.print_exc()
        raise
    
    print("\nStep 6: Setting window properties...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    print("   ✓ Close handler set")
    
    print("\nStep 7: Forcing window visibility...")
    try:
        root.deiconify()
        root.lift()
        root.focus_force()
        root.update()
        root.state('normal')
        print("   ✓ Window forced visible")
    except Exception as e:
        print(f"   ⚠ Warning: {e}")
    
    print("\n" + "=" * 70)
    print("APP INITIALIZED - Starting mainloop...")
    print("Window should be visible now!")
    print("=" * 70)
    print()
    
    root.mainloop()
    
    print("\nMainloop exited")
    
except KeyboardInterrupt:
    print("\n\nInterrupted by user")
except Exception as e:
    print(f"\n\n{'='*70}")
    print(f"CRITICAL ERROR: {type(e).__name__}: {e}")
    print(f"{'='*70}")
    traceback.print_exc()
    print(f"{'='*70}")
    input("\nPress Enter to exit...")
