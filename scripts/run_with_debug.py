"""
Run the app with full debug output captured
"""
import sys
import os
import traceback

# Redirect stderr to stdout to capture all output
sys.stderr = sys.stdout

# Set up UTF-8 encoding early
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except:
    pass

# Safe print function to handle Unicode encoding issues
def safe_print(*args, **kwargs):
    """Print with safe encoding for Windows terminals"""
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        # Replace Unicode characters with ASCII equivalents
        safe_args = []
        for arg in args:
            if isinstance(arg, str):
                arg = arg.replace('✓', '[OK]').replace('✗', '[FAIL]').replace('❌', '[ERROR]').replace('⚠', '[WARN]')
            safe_args.append(arg)
        print(*safe_args, **kwargs)

safe_print("=" * 70)
safe_print("DEBUG MODE: Capturing all terminal output")
safe_print("=" * 70)
safe_print()

try:
    # Try to import from archive first, then try src structure
    safe_print("Attempting to import application...")
    
    # Add src to path for new structure
    src_path = os.path.join(os.path.dirname(__file__), 'src')
    if os.path.exists(src_path):
        sys.path.insert(0, src_path)
        safe_print(f"Added src path: {src_path}")
    
    # Try new structure first (src/ui/main_window.py)
    try:
        safe_print("Trying new application structure (src/ui/main_window)...")
        import tkinter as tk
        from utils.safe_print import setup_utf8_encoding
        setup_utf8_encoding()
        
        root = tk.Tk()
        root.title("CS:GO 2 Translation - DEBUG")
        root.geometry("720x900+100+100")
        
        from ui.main_window import TranslationApp
        safe_print("[OK] Imported TranslationApp from new structure")
        
        safe_print("Creating TranslationApp instance...")
        app = TranslationApp(root)
        safe_print("[OK] Application initialized successfully")
        
        root.protocol("WM_DELETE_WINDOW", app.on_closing)
        root.deiconify()
        root.lift()
        root.focus_force()
        root.update()
        
        safe_print("=" * 70)
        safe_print("Application ready - starting mainloop...")
        safe_print("=" * 70)
        root.mainloop()
        
    except ImportError as ie:
        # Fall back to old structure
        safe_print(f"New structure not available: {ie}")
        safe_print("Trying archive/main_tkinter_free...")
        
        archive_path = os.path.join(os.path.dirname(__file__), 'archive')
        if os.path.exists(archive_path):
            sys.path.insert(0, archive_path)
            from main_tkinter_free import main
            safe_print("[OK] Imported from archive")
            safe_print("Calling main()...")
            safe_print("-" * 70)
            main()
        else:
            raise ImportError("Could not find application entry point. Neither src/ui/main_window.py nor archive/main_tkinter_free.py found.")
    
except KeyboardInterrupt:
    safe_print("\n" + "=" * 70)
    safe_print("Application interrupted by user (Ctrl+C)")
    safe_print("=" * 70)
except Exception as e:
    safe_print("\n" + "=" * 70)
    safe_print(f"CRITICAL ERROR: {e}")
    safe_print("=" * 70)
    traceback.print_exc()
    safe_print("=" * 70)
    input("\nPress Enter to exit...")

