"""
Debug script to run the app and capture all errors
"""
import sys
import os
import traceback

# Add src directory to path
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)
    
    # Setup UTF-8 encoding
try:
    from utils.safe_print import setup_utf8_encoding, safe_print
    setup_utf8_encoding()
except Exception as e:
    print(f"Error setting up safe_print: {e}")
    traceback.print_exc()

def main():
    """Main entry point with error handling"""
    try:
        safe_print("=" * 60)
        safe_print("CS:GO 2 Live Voice Translation Mod - DEBUG MODE")
        safe_print("=" * 60)
        safe_print("Starting application...")
        
        # Test imports
        safe_print("\n[DEBUG] Testing imports...")
        try:
            import tkinter as tk
            safe_print("[OK] tkinter imported")
        except Exception as e:
            safe_print(f"[ERROR] Failed to import tkinter: {e}")
            traceback.print_exc()
            return
        
        try:
    from ui.main_window import TranslationApp
            safe_print("[OK] TranslationApp imported")
        except Exception as e:
            safe_print(f"[ERROR] Failed to import TranslationApp: {e}")
            traceback.print_exc()
            return
        
        # Test integration imports
        safe_print("\n[DEBUG] Testing integration imports...")
        integrations_ok = True
        
        try:
            from integrations.discord import DiscordIntegration
            safe_print("[OK] DiscordIntegration imported")
        except Exception as e:
            safe_print(f"[WARN] DiscordIntegration import failed: {e}")
            integrations_ok = False
        
        try:
            from integrations.obs import OBSIntegration
            safe_print("[OK] OBSIntegration imported")
        except Exception as e:
            safe_print(f"[WARN] OBSIntegration import failed: {e}")
            integrations_ok = False
        
        try:
            from integrations.steam import SteamIntegration
            safe_print("[OK] SteamIntegration imported")
        except Exception as e:
            safe_print(f"[WARN] SteamIntegration import failed: {e}")
            integrations_ok = False
        
        try:
            from core.voice_cloning import VoiceCloner
            safe_print("[OK] VoiceCloner imported")
        except Exception as e:
            safe_print(f"[WARN] VoiceCloner import failed: {e}")
            integrations_ok = False
        
        try:
            from core.collaboration_server import CollaborationServer
            safe_print("[OK] CollaborationServer imported")
        except Exception as e:
            safe_print(f"[WARN] CollaborationServer import failed: {e}")
            integrations_ok = False
        
        if not integrations_ok:
            safe_print("[WARN] Some integrations failed to import - app will continue with available features")
        
        # Create Tkinter root
        safe_print("\n[DEBUG] Creating Tkinter root...")
        try:
    root = tk.Tk()
            root.title("CS:GO 2 Live Voice Translation - DEBUG")
            root.geometry("720x900+100+100")
            safe_print("[OK] Tkinter root created")
        except Exception as e:
            safe_print(f"[ERROR] Failed to create Tkinter root: {e}")
            traceback.print_exc()
            return
        
        # Create application
        safe_print("\n[DEBUG] Creating TranslationApp instance...")
        try:
    app = TranslationApp(root)
            safe_print("[OK] TranslationApp created successfully")
        except Exception as e:
            safe_print(f"[ERROR] Failed to create TranslationApp: {e}")
            traceback.print_exc()
            safe_print("\n[INFO] Attempting to show error dialog...")
            try:
                import tkinter.messagebox as messagebox
                messagebox.showerror("Initialization Error", 
                    f"Failed to initialize application:\n\n{str(e)}\n\nSee console for details.")
            except:
                pass
            return
        
        # Setup close handler
        safe_print("\n[DEBUG] Setting up close handler...")
        root.protocol("WM_DELETE_WINDOW", app.on_closing if hasattr(app, 'on_closing') else root.destroy)
        
        # Make window visible
        safe_print("\n[DEBUG] Making window visible...")
        try:
            root.deiconify()
            root.lift()
            root.focus_force()
            root.update()
            safe_print("[OK] Window should be visible now")
        except Exception as e:
            safe_print(f"[WARN] Error making window visible: {e}")
        
        safe_print("\n" + "=" * 60)
        safe_print("Starting main loop...")
        safe_print("=" * 60 + "\n")
        
        # Start main loop
        try:
    root.mainloop()
            safe_print("\n[OK] Main loop exited normally")
        except KeyboardInterrupt:
            safe_print("\n[WARN] Interrupted by user")
        except Exception as e:
            safe_print(f"\n[ERROR] Error in main loop: {e}")
            traceback.print_exc()
    
except Exception as e:
        safe_print(f"\n[CRITICAL ERROR] {e}")
    traceback.print_exc()
        input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
