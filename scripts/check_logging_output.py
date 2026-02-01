"""
Check what's actually being logged to terminal and verify translation flow
"""
import sys
import time
import threading

print("=" * 70)
print("CHECKING TERMINAL AND TRANSLATION LOGS")
print("=" * 70)
print()

# Test the actual logging flow
def test_logging_flow():
    """Test the complete logging flow"""
    
    print("Step 1: Testing log_message function...")
    try:
        import tkinter as tk
        from main_tkinter_free import TranslationApp, safe_print
        
        root = tk.Tk()
        root.withdraw()
        app = TranslationApp(root)
        
        # Test various log messages
        app.log_message("Test message 1")
        app.log_message("[OK] Test success message")
        app.log_message("[ERROR] Test error message")
        app.log_message("[WARN] Test warning message")
        
        print("  [OK] log_message tested")
        
        print("\nStep 2: Testing transcription logging...")
        # Simulate transcriptions
        test_cases = [
            ("Hello", "en"),
            ("Hola", "es"),
            ("Bonjour", "fr"),
        ]
        
        app.translator = None  # Will be set up properly
        
        for text, lang in test_cases:
            print(f"  Simulating: '{text}' ({lang})")
            app.on_transcription(text, lang)
            time.sleep(0.5)
        
        print("  [OK] Transcription logging tested")
        
        print("\nStep 3: Testing translation logging...")
        from translation import Translator
        
        translation_count = [0]
        
        def test_callback(orig, trans, src, tgt):
            translation_count[0] += 1
            print(f"  Translation {translation_count[0]}: [{src}->{tgt}] '{orig}' -> '{trans}'")
        
        app.translator = Translator(callback=test_callback)
        app.translator.start()
        
        # Test translations
        app.translator.translate_async("Hola mundo", "es")
        app.translator.translate_async("Hello", "en")
        app.translator.translate_async("Bonjour", "fr")
        
        print("  Waiting for translations...")
        time.sleep(3)
        
        print(f"  [OK] {translation_count[0]} translations received")
        
        app.translator.stop()
        root.destroy()
        
        return True
        
    except Exception as e:
        print(f"  [ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

# Run test
if test_logging_flow():
    print("\n" + "=" * 70)
    print("[OK] ALL LOGGING TESTS PASSED")
    print("=" * 70)
else:
    print("\n" + "=" * 70)
    print("[ERROR] SOME TESTS FAILED")
    print("=" * 70)
    sys.exit(1)

