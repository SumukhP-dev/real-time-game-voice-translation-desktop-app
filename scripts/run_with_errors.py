"""
Run app with full error capture - ensures Python stays running
"""
import sys
import os
import traceback

# Redirect stderr to stdout to see all errors
sys.stderr = sys.stdout

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("=" * 70)
print("APPLICATION STARTUP WITH ERROR CAPTURE")
print("=" * 70)
print(f"Python: {sys.version}")
print(f"Working directory: {os.getcwd()}")
print("=" * 70)
print()

try:
    print("[1/6] Setting up encoding...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    safe_print("   [OK] OK")
    
    print("\n[2/6] Importing tkinter...")
    import tkinter as tk
    safe_print("   [OK] OK")
    
    print("\n[3/6] Creating root window...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation - DEBUG")
    root.geometry("720x900+100+100")
    safe_print("   [OK] Root created")
    
    print("\n[4/6] Importing TranslationApp...")
    from ui.main_window import TranslationApp
    safe_print("   [OK] Imported")
    
    print("\n[5/6] Creating TranslationApp instance...")
    print("   (This may take a moment...)")
    app = TranslationApp(root)
    safe_print("   [OK] App created")
    
    print("\n[6/6] Setting up and showing window...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    root.deiconify()
    root.lift()
    root.focus_force()
    root.update()
    
    print("\n" + "=" * 70)
    print("WINDOW SHOULD BE VISIBLE NOW!")
    print("Starting mainloop - Python will stay running...")
    print("=" * 70)
    print()
    
    root.mainloop()
    
    print("\nMainloop exited - application closed")
    
except KeyboardInterrupt:
    print("\n\nInterrupted by user (Ctrl+C)")
except Exception as e:
    print(f"\n\n{'='*70}")
    print(f"ERROR: {type(e).__name__}: {e}")
    print(f"{'='*70}")
    traceback.print_exc()
    print(f"{'='*70}")
    print("\nPython process will stay alive - press Enter to exit...")
    input()
