"""
Monitor runtime logging to catch any issues during actual app execution
"""
import sys
import time
import threading

print("=" * 70)
print("RUNTIME LOG MONITORING")
print("=" * 70)
print()

# Monitor what actually happens during runtime
def monitor_runtime():
    """Monitor the app during runtime"""
    
    try:
        import tkinter as tk
        from main_tkinter_free import TranslationApp, safe_print
        from translation import Translator
        
        print("Initializing app...")
        root = tk.Tk()
        root.withdraw()
        app = TranslationApp(root)
        print("[OK] App initialized\n")
        
        # Simulate what happens when user clicks "Start Translation"
        print("Simulating 'Start Translation' button click...")
        try:
            # Initialize translator
            app.translator = Translator(callback=app.on_translation)
            app.translator.start()
            print("[OK] Translator started\n")
            
            # Simulate audio coming in and being transcribed
            print("Simulating audio transcription flow...")
            
            # Test 1: English transcription (no translation needed)
            print("\n1. English transcription:")
            app.on_transcription("Hello world", "en")
            time.sleep(1)
            
            # Test 2: Spanish transcription (needs translation)
            print("\n2. Spanish transcription:")
            app.on_transcription("Hola mundo", "es")
            time.sleep(2)
            
            # Test 3: French transcription (needs translation)
            print("\n3. French transcription:")
            app.on_transcription("Bonjour", "fr")
            time.sleep(2)
            
            # Test 4: Multiple rapid transcriptions
            print("\n4. Rapid transcriptions:")
            for i, (text, lang) in enumerate([("Test 1", "en"), ("Test 2", "en"), ("Test 3", "en")]):
                app.on_transcription(text, lang)
                time.sleep(0.5)
            
            time.sleep(2)
            
            print("\n[OK] All transcription flows tested")
            
            app.translator.stop()
            
        except Exception as e:
            print(f"[ERROR] Translation flow failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        # Test log_message from different contexts
        print("\nTesting log_message from different contexts...")
        try:
            # From main thread
            app.log_message("Main thread log")
            
            # From background thread
            def background_log():
                app.log_message("Background thread log")
            
            thread = threading.Thread(target=background_log, daemon=True)
            thread.start()
            thread.join(timeout=1)
            
            print("[OK] Multi-threaded logging works")
            
        except Exception as e:
            print(f"[ERROR] Multi-threaded logging failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        root.destroy()
        return True
        
    except Exception as e:
        print(f"[ERROR] Runtime monitoring failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# Run monitoring
if monitor_runtime():
    print("\n" + "=" * 70)
    print("[PASS] Runtime monitoring completed successfully")
    print("=" * 70)
    sys.exit(0)
else:
    print("\n" + "=" * 70)
    print("[FAIL] Runtime monitoring found issues")
    print("=" * 70)
    sys.exit(1)

