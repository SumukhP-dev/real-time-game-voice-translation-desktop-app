"""
Capture all output to file that we can read
"""
import sys
import os
import traceback

# Open log file immediately
log = open('app_capture.log', 'w', encoding='utf-8')

def output(msg):
    log.write(msg + '\n')
    log.flush()
    print(msg)
    sys.stdout.flush()

output("=" * 70)
output("APPLICATION STARTUP CAPTURE")
output("=" * 70)
output(f"Python: {sys.version}")
output(f"Directory: {os.getcwd()}")
output("=" * 70)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    output("\n[1] Importing safe_print...")
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    output("   OK")
    
    output("\n[2] Importing tkinter...")
    import tkinter as tk
    output("   OK")
    
    output("\n[3] Creating root...")
    root = tk.Tk()
    root.title("CS:GO 2 Translation")
    root.geometry("720x900+100+100")
    output("   OK")
    
    output("\n[4] Importing TranslationApp...")
    from ui.main_window import TranslationApp
    output("   OK")
    
    output("\n[5] Creating app instance...")
    output("   (This may take time...)")
    app = TranslationApp(root)
    output("   OK - App created")
    
    output("\n[6] Setting up window...")
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.deiconify()
    root.lift()
    root.update()
    output("   OK")
    
    output("\n" + "=" * 70)
    output("READY - Starting mainloop")
    output("Window should be visible!")
    output("=" * 70)
    
    root.mainloop()
    
    output("Mainloop exited")
    
except Exception as e:
    output(f"\nERROR: {type(e).__name__}: {e}")
    output("Traceback:")
    output(traceback.format_exc())
finally:
    log.close()
    output("\nLog saved to app_capture.log")
