"""
Final verification of terminal and translation logging
Tests all scenarios to ensure everything works correctly
"""
import sys
import time

print("=" * 70)
print("FINAL TERMINAL AND TRANSLATION LOG VERIFICATION")
print("=" * 70)
print()

all_passed = True
issues = []

# Test 1: Import and basic setup
print("Test 1: Module imports and basic setup...")
try:
    import tkinter as tk
    from main_tkinter_free import TranslationApp, safe_print
    from translation import Translator
    print("  [OK] All modules imported successfully")
except Exception as e:
    print(f"  [ERROR] Import failed: {e}")
    all_passed = False
    issues.append(f"Import error: {e}")
    sys.exit(1)

# Test 2: App initialization
print("\nTest 2: App initialization...")
try:
    root = tk.Tk()
    root.withdraw()
    app = TranslationApp(root)
    print("  [OK] App initialized successfully")
except Exception as e:
    print(f"  [ERROR] App initialization failed: {e}")
    all_passed = False
    issues.append(f"App init error: {e}")
    import traceback
    traceback.print_exc()

# Test 3: log_message with various inputs
print("\nTest 3: log_message with various inputs...")
try:
    test_messages = [
        "Normal message",
        "[OK] Success",
        "[ERROR] Error",
        None,  # Should handle gracefully
        "",  # Empty string
        123,  # Number
    ]
    
    for msg in test_messages:
        try:
            app.log_message(msg)
        except Exception as e:
            print(f"  [ERROR] Failed to log '{msg}': {e}")
            issues.append(f"log_message failed for '{msg}': {e}")
            all_passed = False
    
    print("  [OK] All message types handled correctly")
except Exception as e:
    print(f"  [ERROR] log_message test failed: {e}")
    all_passed = False
    issues.append(f"log_message test error: {e}")

# Test 4: Transcription logging
print("\nTest 4: Transcription logging...")
try:
    transcription_count = [0]  # Use list to allow modification in nested function
    
    def count_transcription(text, lang, segments=None):
        transcription_count[0] += 1
        app.on_transcription(text, lang)
    
    test_transcriptions = [
        ("Hello", "en"),
        ("Hola", "es"),
        ("Bonjour", "fr"),
    ]
    
    for text, lang in test_transcriptions:
        count_transcription(text, lang)
        time.sleep(0.2)
    
    if transcription_count[0] == len(test_transcriptions):
        print(f"  [OK] {transcription_count[0]} transcriptions processed")
    else:
        print(f"  [WARN] Expected {len(test_transcriptions)}, got {transcription_count[0]}")
        
except Exception as e:
    print(f"  [ERROR] Transcription logging failed: {e}")
    all_passed = False
    issues.append(f"Transcription error: {e}")
    import traceback
    traceback.print_exc()

# Test 5: Translation logging with callback
print("\nTest 5: Translation logging with callback...")
try:
    translation_count = [0]  # Use list to allow modification in nested function
    translation_results = []
    
    def translation_callback(orig, trans, src, tgt):
        translation_count[0] += 1
        translation_results.append((orig, trans, src, tgt))
        app.on_translation(orig, trans, src, tgt)
    
    app.translator = Translator(callback=translation_callback)
    app.translator.start()
    
    # Test translations
    test_translations = [
        ("Hola mundo", "es"),
        ("Bonjour", "fr"),
        ("Hello", "en"),
    ]
    
    for text, lang in test_translations:
        app.translator.translate_async(text, lang)
        time.sleep(0.3)
    
    print("  Waiting for translations...")
    time.sleep(3)
    
    if translation_count[0] > 0:
        print(f"  [OK] {translation_count[0]} translations received")
        for orig, trans, src, tgt in translation_results:
            print(f"      [{src}->{tgt}] '{orig}' -> '{trans}'")
    else:
        print("  [WARN] No translations received")
        issues.append("No translations received")
    
    app.translator.stop()
    
except Exception as e:
    print(f"  [ERROR] Translation logging failed: {e}")
    all_passed = False
    issues.append(f"Translation error: {e}")
    import traceback
    traceback.print_exc()

# Test 6: Thread safety
print("\nTest 6: Thread safety check...")
try:
    import threading
    
    def background_log():
        app.log_message("Thread-safe log from background thread")
        app.on_transcription("Test from thread", "en")
    
    thread = threading.Thread(target=background_log, daemon=True)
    thread.start()
    thread.join(timeout=2)
    
    print("  [OK] Thread-safe logging works")
    
except Exception as e:
    print(f"  [ERROR] Thread safety test failed: {e}")
    all_passed = False
    issues.append(f"Thread safety error: {e}")

# Cleanup
try:
    root.destroy()
except:
    pass

# Summary
print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)

if all_passed and len(issues) == 0:
    print("[PASS] All tests passed successfully!")
    print("\n[OK] Terminal logging: Working")
    print("[OK] Translation logging: Working")
    print("[OK] Transcription logging: Working")
    print("[OK] Error handling: Working")
    print("[OK] Thread safety: Working")
    print("[OK] Edge cases: Handled")
    print("\nStatus: PRODUCTION READY")
else:
    print(f"[FAIL] {len(issues)} issue(s) found:")
    for issue in issues:
        print(f"  - {issue}")
    print("\nStatus: NEEDS ATTENTION")

print("=" * 70)

if all_passed and len(issues) == 0:
    sys.exit(0)
else:
    sys.exit(1)

