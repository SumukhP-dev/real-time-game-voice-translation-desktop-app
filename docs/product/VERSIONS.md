# Version Comparison Guide

This project now has **TWO versions** - choose the one that works best for you!

## 🆓 FREE VERSION (`main_tkinter_free.py`)

**Best for:** Users who want zero third-party software

### Features:
- ✅ Uses Windows WASAPI (native Windows API)
- ✅ **No WASAPI loopback needed**
- ✅ **No paid software required**
- ✅ Simpler setup
- ✅ Uses `sounddevice` library (free Python package)

### Requirements:
- Windows 10/11
- `sounddevice` library (`pip install sounddevice`)
- May require "Stereo Mix" enabled in Windows (if WASAPI loopback doesn't work directly)

### How to Run:
```bash
python main_tkinter_free.py
```

### Limitations:
- May not work if Stereo Mix is on WDM-KS driver
- Requires Windows 10/11
- Some systems may need Stereo Mix enabled

---

## 📦 STANDARD VERSION (`main_tkinter.py`)

**Best for:** Maximum compatibility and reliability

### Features:
- ✅ Works with WASAPI loopback (free but third-party)
- ✅ Works with Stereo Mix (if not on WDM-KS)
- ✅ Multi-method fallback system
- ✅ Better error handling
- ✅ More diagnostic tools ("Check System Audio" button)

### Requirements:
- Windows 10/11
- WASAPI loopback (free download) - recommended
- OR Stereo Mix enabled in Windows

### How to Run:
```bash
python main_tkinter.py
```

### Advantages:
- Most reliable system audio capture
- Works even when WASAPI loopback fails
- Better device detection and diagnostics
- Clear setup instructions

---

## Which Version Should I Use?

### Use FREE VERSION if:
- ✅ You want zero third-party software installation
- ✅ You're on Windows 10/11
- ✅ You're okay with potentially needing to enable Stereo Mix
- ✅ You want the simplest possible setup

### Use STANDARD VERSION if:
- ✅ You want maximum reliability
- ✅ You don't mind installing WASAPI loopback (free)
- ✅ You want better diagnostics and error messages
- ✅ You want the most compatible solution

---

## Quick Comparison

| Feature | FREE Version | Standard Version |
|---------|-------------|------------------|
| **Third-party software** | ❌ None | ✅ WASAPI (free) |
| **Setup complexity** | ⭐ Easy | ⭐⭐ Medium |
| **Reliability** | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent |
| **Diagnostics** | ⭐⭐ Basic | ⭐⭐⭐⭐ Advanced |
| **Compatibility** | Windows 10/11 | All Windows |
| **WDM-KS support** | ❌ Limited | ✅ Via WASAPI |

---

## Installation

Both versions use the same dependencies:
```bash
pip install -r requirements.txt
```

The main difference is:
- **FREE version**: Uses `sounddevice` with WASAPI (already included)
- **Standard version**: Can use WASAPI loopback (optional but recommended)

---

## Troubleshooting

### FREE Version Issues:
1. If WASAPI loopback doesn't work, enable "Stereo Mix" in Windows
2. If still not working, try the Standard Version with WASAPI loopback

### Standard Version Issues:
1. Install WASAPI loopback (see `AUDIO_DEVICE_GUIDE.md`)
2. Use "Check System Audio" button for diagnostics

---

## Recommendation

**For most users:** Start with the **FREE version**. If it doesn't work on your system, switch to the **Standard version** with WASAPI loopback.

Both are completely free - the only difference is whether you need to install third-party software or not!

---

**Enjoy your free translation mod!** 🎉

