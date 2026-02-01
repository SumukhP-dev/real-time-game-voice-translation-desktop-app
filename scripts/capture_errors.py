"""
Capture all errors and output to file
"""
import sys
import os
import traceback

# Open log file
log_file = open('error_capture.log', 'w', encoding='utf-8')

def log(msg):
    """Log to both file and console"""
    print(msg)
    log_file.write(msg + '\n')
    log_file.flush()
    sys.stdout.flush()

log("=" * 70)
log("ERROR CAPTURE - Starting application")
log("=" * 70)
log(f"Python: {sys.version}")
log(f"Working dir: {os.getcwd()}")
log("=" * 70)

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
log(f"Added to path: {os.path.join(os.path.dirname(__file__), 'src')}")

try:
    log("\n[1] Importing safe_print...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    log("   ✓ OK")
    
    log("\n[2] Importing tkinter...")
    import tkinter as tk
    log("   ✓ OK")
    
    log("\n[3] Creating root window...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation - ERROR CAPTURE")
    root.geometry("720x900+100+100")
    log("   ✓ Root created")
    
    log("\n[4] Importing TranslationApp...")
    from ui.main_window import TranslationApp
    log("   ✓ Imported")
    
    log("\n[5] Creating TranslationApp instance...")
    log("   (This may take a moment - checking for errors...)")
    try:
        app = TranslationApp(root)
        log("   ✓ App created successfully")
    except Exception as e:
        log(f"   ✗ ERROR: {type(e).__name__}: {e}")
        log("   Full traceback:")
        tb = traceback.format_exc()
        log(tb)
        raise
    
    log("\n[6] Setting up window...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.deiconify()
    root.lift()
    root.focus_force()
    root.update()
    log("   ✓ Window setup complete")
    
    log("\n" + "=" * 70)
    log("APPLICATION READY - Starting mainloop")
    log("Window should be visible now!")
    log("=" * 70)
    log("")
    
    root.mainloop()
    
    log("\nMainloop exited - application closed")
    
except KeyboardInterrupt:
    log("\n\nInterrupted by user")
except Exception as e:
    log(f"\n\n{'='*70}")
    log(f"CRITICAL ERROR: {type(e).__name__}: {e}")
    log(f"{'='*70}")
    log("Full traceback:")
    log(traceback.format_exc())
    log(f"{'='*70}")
    log("\nCheck error_capture.log for full details")
finally:
    log_file.close()
    print("\n" + "=" * 70)
    print("Check error_capture.log for full output")
    print("=" * 70)
