"""
Run app with full error capture - writes to file we can read
"""
import sys
import os
import traceback
from datetime import datetime

# Create log file immediately
log_path = 'full_capture.log'
log_file = open(log_path, 'w', encoding='utf-8')

def log(msg):
    timestamp = datetime.now().strftime('%H:%M:%S.%f')[:-3]
    log_file.write(f"[{timestamp}] {msg}\n")
    log_file.flush()
    # Also print to console
    try:
        print(msg)
        sys.stdout.flush()
    except:
        pass

log("=" * 70)
log("FULL APPLICATION CAPTURE")
log(f"Started at: {datetime.now()}")
log(f"Python: {sys.version}")
log(f"Directory: {os.getcwd()}")
log("=" * 70)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
log(f"Added to path: {os.path.join(os.path.dirname(__file__), 'src')}")

try:
    log("\n[STEP 1] Setting up encoding...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    log("   [OK] Complete")
    
    log("\n[STEP 2] Importing tkinter...")
    import tkinter as tk
    log("   [OK] Complete")
    
    log("\n[STEP 3] Creating root window...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation")
    root.geometry("720x900+100+100")
    log("   [OK] Root created")
    
    log("\n[STEP 4] Importing TranslationApp...")
    from ui.main_window import TranslationApp
    log("   [OK] Imported")
    
    log("\n[STEP 5] Creating TranslationApp instance...")
    log("   (This may take time - initializing all components...)")
    try:
        app = TranslationApp(root)
        log("   [OK] TranslationApp created successfully")
    except Exception as e:
        log(f"   [ERROR] {type(e).__name__}: {e}")
        log("   Traceback:")
        tb = traceback.format_exc()
        for line in tb.split('\n'):
            log(f"      {line}")
        raise
    
    log("\n[STEP 6] Setting up window handlers...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    log("   [OK] Close handler set")
    
    log("\n[STEP 7] Making window visible...")
    root.deiconify()
    root.lift()
    root.focus_force()
    root.update()
    log("   [OK] Window should be visible now")
    
    log("\n" + "=" * 70)
    log("APPLICATION READY")
    log("Window should be visible on your screen")
    log("Starting mainloop - application will stay running...")
    log("=" * 70)
    log("")
    
    root.mainloop()
    
    log("\nMainloop exited - application closed")
    
except KeyboardInterrupt:
    log("\n\nInterrupted by user (Ctrl+C)")
except Exception as e:
    log(f"\n\n{'='*70}")
    log(f"CRITICAL ERROR: {type(e).__name__}: {e}")
    log(f"{'='*70}")
    log("Full traceback:")
    tb = traceback.format_exc()
    for line in tb.split('\n'):
        log(f"  {line}")
    log(f"{'='*70}")
finally:
    log_file.close()
    print(f"\n{'='*70}")
    print(f"Full log saved to: {log_path}")
    print(f"{'='*70}")
