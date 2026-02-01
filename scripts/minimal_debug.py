#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os

# Write to file immediately
with open('debug_output.txt', 'w', encoding='utf-8') as f:
    f.write("Script started\n")
    f.write(f"Python: {sys.version}\n")
    f.write(f"Directory: {os.getcwd()}\n")
    f.flush()

print("DEBUG: Script running")
sys.stdout.flush()

try:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Added src to path\n")
        f.flush()
    
    from utils.safe_print import safe_print, setup_utf8_encoding
    setup_utf8_encoding()
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Imported safe_print\n")
        f.flush()
    
    import tkinter as tk
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Imported tkinter\n")
        f.flush()
    
    root = tk.Tk()
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Created root\n")
        f.flush()
    
    from ui.main_window import TranslationApp
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Imported TranslationApp\n")
        f.flush()
    
    app = TranslationApp(root)
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Created app - SUCCESS\n")
        f.flush()
    
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.deiconify()
    root.lift()
    root.update()
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Window setup complete - starting mainloop\n")
        f.flush()
    
    root.mainloop()
    
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write("Mainloop exited\n")
        f.flush()
        
except Exception as e:
    with open('debug_output.txt', 'a', encoding='utf-8') as f:
        f.write(f"ERROR: {type(e).__name__}: {e}\n")
        import traceback
        f.write(traceback.format_exc())
        f.flush()
    raise
