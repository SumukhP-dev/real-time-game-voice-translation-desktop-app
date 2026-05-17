# Audio Device Selection Guide

## For FREE Version (`main_tkinter_free.py`)

### ✅ **What You Need: "Stereo Mix"**

The FREE version **automatically looks for and uses "Stereo Mix"** - a built-in Windows feature that captures all system audio.

### How to Enable Stereo Mix:

1. **Right-click** the speaker icon in your system tray (bottom-right corner)
2. Select **"Sounds"** or **"Sound settings"**
3. Go to the **"Recording"** tab
4. **Right-click** in the empty space in the device list
5. Select **"Show Disabled Devices"**
6. Find **"Stereo Mix"** in the list
7. **Right-click** on "Stereo Mix" → **"Enable"**
8. (Optional) Right-click → **"Set as Default Device"**

### In the App:

- The app will **automatically detect and use "Stereo Mix"** if it's enabled
- You don't need to manually select it - the app finds it automatically
- If Stereo Mix is not found, you'll see a message with instructions

### Device Names to Look For:

The app searches for devices with these names:
- **"Stereo Mix"** (most common)
- **"Loopback"** 
- **"What U Hear"** (some audio drivers)

---

## For Electron app (current)

### Option 1: WASAPI loopback (RECOMMENDED on Windows)

1. Open the app → **Audio Settings**
2. Select your **headphones or speakers** (name includes **WASAPI loopback**)
3. Click **Start Capture**
4. Play game or system audio; status logs should show non-zero RMS

### Option 2: Stereo Mix

1. Enable Stereo Mix (same steps as above)
2. In the app, click **"Select Stereo Mix"** button
3. Or manually select **"Stereo Mix"** from the dropdown

---

## Quick Reference

| Version | Device to Use | How to Get It |
|---------|--------------|---------------|
| **FREE Version** | **Stereo Mix** | Enable in Windows Sound settings (Recording tab) |
| **Electron app** | **WASAPI loopback** OR **Stereo Mix** | Built-in on Windows 10/11, or enable Stereo Mix |

---

## Troubleshooting

### "No loopback device found" (FREE Version)

**Solution:** Enable Stereo Mix:
1. Windows Sound settings → Recording tab
2. Right-click → Show Disabled Devices
3. Enable "Stereo Mix"
4. Restart the app

### "Stereo Mix not in dropdown" (Standard Version)

**Solution:** 
1. Make sure Stereo Mix is enabled (see above)
2. Click **"Refresh Devices"** button in the app
3. Or use WASAPI loopback instead

### "Device selected but no audio captured"

**Check:**
1. Is audio actually playing on your computer? (Test with YouTube)
2. Is the correct device selected in the app?
3. For FREE version: Is Stereo Mix enabled and working?
4. For Standard version: Is WASAPI loopback set as default playback device?

---

## Summary

**FREE Version:** Just enable **"Stereo Mix"** in Windows - the app will find it automatically!

**Standard Version:** Use **"WASAPI loopback"** (recommended) or **"Stereo Mix"** - click "Select Stereo Mix" button to auto-select.

---

**Need help?** See `FREE_VERSION_README.md` or `README.md` for more details.

