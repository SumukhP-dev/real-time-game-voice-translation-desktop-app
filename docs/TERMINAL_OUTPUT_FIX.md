# Terminal Output Debug Fix

## Problem
The application was crashing with `UnicodeEncodeError: 'cp932' codec can't encode character` errors when trying to print Unicode characters (✓, ✗, ❌, etc.) on Windows terminals that use cp932 encoding.

## Solution
Implemented a comprehensive fix that:

1. **Created a centralized `safe_print` utility** (`src/csgo2_translation/utils/safe_print.py`)
   - Automatically handles Unicode encoding errors
   - Replaces Unicode characters with ASCII-safe equivalents
   - Falls back gracefully if encoding fails

2. **Set UTF-8 encoding at startup**
   - Added `setup_utf8_encoding()` function that attempts to configure stdout/stderr to use UTF-8
   - Called at the start of all main entry points

3. **Updated all print statements**
   - Replaced Unicode characters (✓, ✗, ❌, ✅, ⚠, ℹ, 📢, 🎮, 🔊, 🎤) with ASCII equivalents ([OK], [FAIL], [ERROR], [WARN], [INFO], etc.)
   - Updated main entry points (`src/csgo2_translation/main.py`, `main_tkinter.py`)
   - Updated `main_window.py` to use `safe_print` instead of `print`
   - Updated `translator.py` and `recognizer.py` to use centralized `safe_print`

## Files Modified

1. **New file**: `src/csgo2_translation/utils/safe_print.py`
   - Centralized safe print utility with Unicode character replacement

2. **Updated**: `src/csgo2_translation/utils/__init__.py`
   - Exports `safe_print` and `setup_utf8_encoding`

3. **Updated**: `src/csgo2_translation/main.py`
   - Sets up UTF-8 encoding at startup
   - Uses `safe_print` for all output
   - Added proper error handling

4. **Updated**: `main_tkinter.py`
   - Sets up UTF-8 encoding at startup
   - Uses `safe_print` for all output
   - Added proper error handling

5. **Updated**: `src/csgo2_translation/ui/main_window.py`
   - Imports and uses `safe_print`
   - Replaced all Unicode characters in print statements

6. **Updated**: `src/csgo2_translation/core/translation/translator.py`
   - Uses centralized `safe_print` instead of local implementation

7. **Updated**: `src/csgo2_translation/core/speech/recognizer.py`
   - Uses centralized `safe_print` instead of local implementation

## Unicode Character Replacements

- `✓` → `[OK]`
- `✗` → `[FAIL]`
- `❌` → `[ERROR]`
- `✅` → `[OK]`
- `⚠` / `⚠️` → `[WARN]`
- `ℹ` / `ℹ️` → `[INFO]`
- `📢` → `[AUDIO]`
- `🎮` → `[GAME]`
- `🔊` → `[AUDIO]`
- `🎤` → `[MIC]`
- `→` → `->`
- `←` → `<-`
- `↑` → `^`
- `↓` → `v`

## Testing
The application should now run without Unicode encoding errors on Windows terminals, even when using cp932 or other non-UTF-8 encodings. All output will be ASCII-safe while maintaining readability.

