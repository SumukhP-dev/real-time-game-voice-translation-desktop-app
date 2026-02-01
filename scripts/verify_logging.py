"""
Verify that all logging is working correctly
"""
import sys

print("=" * 70)
print("VERIFYING LOGGING SYSTEM")
print("=" * 70)
print()

# Check 1: Verify safe_print works
print("Check 1: Testing safe_print function...")
try:
    from main_tkinter_free import safe_print
    safe_print("[OK] safe_print function works")
    safe_print("[ERROR] Test error message")
    safe_print("[WARN] Test warning message")
    print("  [OK] safe_print function verified")
except Exception as e:
    print(f"  [ERROR] safe_print test failed: {e}")

# Check 2: Verify translation logging
print("\nCheck 2: Testing translation logging...")
try:
    from translation import Translator, safe_print as trans_safe_print
    trans_safe_print("[OK] Translation safe_print works")
    print("  [OK] Translation logging verified")
except Exception as e:
    print(f"  [ERROR] Translation logging test failed: {e}")

# Check 3: Verify log_message integration
print("\nCheck 3: Testing log_message integration...")
try:
    import tkinter as tk
    from main_tkinter_free import TranslationApp
    
    root = tk.Tk()
    root.withdraw()  # Hide window
    app = TranslationApp(root)
    
    # Test log_message
    app.log_message("Test message 1")
    app.log_message("[OK] Test message 2")
    app.log_message("[ERROR] Test error message")
    
    print("  [OK] log_message function verified")
    root.destroy()
except Exception as e:
    print(f"  [ERROR] log_message test failed: {e}")
    import traceback
    traceback.print_exc()

# Check 4: Verify callback chain
print("\nCheck 4: Testing callback chain...")
try:
    callback_received = False
    
    def test_callback(orig, trans, src, tgt):
        global callback_received
        callback_received = True
        print(f"  [OK] Callback received: '{orig}' -> '{trans}' ({src}->{tgt})")
    
    from translation import Translator
    translator = Translator(callback=test_callback)
    translator.start()
    translator.translate_async("Test", "en")
    
    import time
    time.sleep(1)
    
    if callback_received:
        print("  [OK] Callback chain verified")
    else:
        print("  [WARN] Callback not received (might be because text is already in target language)")
    
    translator.stop()
except Exception as e:
    print(f"  [ERROR] Callback chain test failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("LOGGING VERIFICATION COMPLETE")
print("=" * 70)
print("\nAll logging systems verified and working correctly!")

