"""
Run app with full debug output to file
"""
import sys
import os
import traceback

# Write all output to file
log_file = open('app_debug_output.log', 'w', encoding='utf-8')

def log(msg):
    log_file.write(msg + '\n')
    log_file.flush()
    print(msg)
    sys.stdout.flush()

log("=" * 70)
log("APPLICATION DEBUG OUTPUT")
log("=" * 70)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    log("Step 1: Importing safe_print...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    log("   OK")
    
    log("Step 2: Importing tkinter...")
    import tkinter as tk
    log("   OK")
    
    log("Step 3: Creating root...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation")
    root.geometry("720x900+100+100")
    log("   OK")
    
    log("Step 4: Importing TranslationApp...")
    from ui.main_window import TranslationApp
    log("   OK")
    
    log("Step 5: Creating app (this may take time)...")
    app = TranslationApp(root)
    log("   OK")
    
    log("Step 6: Setting up window...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.deiconify()
    root.lift()
    root.update()
    log("   OK")
    
    log("=" * 70)
    log("STARTING MAINLOOP - Window should be visible")
    log("=" * 70)
    
    root.mainloop()
    
    log("Mainloop exited")
    
except Exception as e:
    log(f"ERROR: {type(e).__name__}: {e}")
    log(traceback.format_exc())
finally:
    log_file.close()
    print("\nCheck app_debug_output.log for full details")
