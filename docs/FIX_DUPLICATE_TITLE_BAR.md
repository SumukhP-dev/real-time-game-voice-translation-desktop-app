# Fix: Duplicate Title Bars

## Problem

The application was showing two title bars:

1. Windows default title bar (with minimize/maximize/close)
2. Custom application title bar (duplicate)

## Solution

The custom title bar has been **disabled** in the code. The application now uses only the Windows default title bar.

## What Changed

- Custom title bar creation is commented out in `setup_ui()` method
- Only the Windows title bar will be displayed
- The toolbar below still shows status and buttons (History, Statistics, Privacy, Integration, About, etc.)

## To See the Fix

**Restart the application** - Close it completely and restart to see only one title bar.

## If You Want Custom Title Bar Back

To re-enable the custom title bar (which removes the Windows title bar):

1. In `__init__` method (around line 192), uncomment:

   ```python
   self.root.overrideredirect(True)
   ```

2. In `setup_ui` method (around line 811), uncomment:
   ```python
   self.create_custom_title_bar()
   ```

**Note:** Using `overrideredirect(True)` removes the Windows title bar completely, which means you'll need the custom title bar for window controls.
