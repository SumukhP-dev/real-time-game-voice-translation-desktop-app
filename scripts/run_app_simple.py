"""
Simplified app runner that ensures Python stays running
"""
import sys
import os
import tkinter as tk

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

print("=" * 70)
print("STARTING APPLICATION")
print("=" * 70)
sys.stdout.flush()

try:
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
    
    print("Creating window...")
    sys.stdout.flush()
    
    root = tk.Tk()
    root.title("CS:GO 2 Translation")
    root.geometry("720x900+100+100")
    
    print("Importing TranslationApp...")
    sys.stdout.flush()
    
    from ui.main_window import TranslationApp
    
    print("Creating app instance...")
    sys.stdout.flush()
    
    app = TranslationApp(root)
    
    print("Setting up close handler...")
    sys.stdout.flush()
    
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    print("Making window visible...")
    sys.stdout.flush()
    
    root.deiconify()
    root.lift()
    root.focus_force()
    root.update()
    
    print("=" * 70)
    print("WINDOW SHOULD BE VISIBLE NOW!")
    print("Starting mainloop...")
    print("=" * 70)
    sys.stdout.flush()
    
    # Keep Python process alive
    root.mainloop()
    
    print("Application closed")
    
except Exception as e:
    print(f"\nERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    input("\nPress Enter to exit...")
