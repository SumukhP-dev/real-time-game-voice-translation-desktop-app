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

## For Standard Version (`main_tkinter.py`)

### Option 1: VB-Audio Virtual Cable (RECOMMENDED)

1. Install VB-Audio Virtual Cable (free): https://vb-audio.com/Cable/
2. Restart your computer
3. In the app, select **"CABLE Input (VB-Audio Virtual Cable)"** from the dropdown
4. Click **"Select Stereo Mix"** button - it will auto-select VB-Audio Cable if available

### Option 2: Stereo Mix

1. Enable Stereo Mix (same steps as above)
2. In the app, click **"Select Stereo Mix"** button
3. Or manually select **"Stereo Mix"** from the dropdown

---

## Quick Reference

| Version | Device to Use | How to Get It |
|---------|--------------|---------------|
| **FREE Version** | **Stereo Mix** | Enable in Windows Sound settings (Recording tab) |
| **Standard Version** | **VB-Audio Virtual Cable** OR **Stereo Mix** | Install VB-Audio OR enable Stereo Mix |

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
3. Or use VB-Audio Virtual Cable instead

### "Device selected but no audio captured"

**Check:**
1. Is audio actually playing on your computer? (Test with YouTube)
2. Is the correct device selected in the app?
3. For FREE version: Is Stereo Mix enabled and working?
4. For Standard version: Is VB-Audio Virtual Cable set as default playback device?

---

## Summary

**FREE Version:** Just enable **"Stereo Mix"** in Windows - the app will find it automatically!

**Standard Version:** Use **"VB-Audio Virtual Cable"** (recommended) or **"Stereo Mix"** - click "Select Stereo Mix" button to auto-select.

---

**Need help?** See `FREE_VERSION_README.md` or `README.md` for more details.

