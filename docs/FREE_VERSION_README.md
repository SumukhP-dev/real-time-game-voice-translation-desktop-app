# FREE VERSION - No Third-Party Software Required! 🆓

This is the **FREE version** that uses Windows native WASAPI loopback to capture system audio. **No VB-Audio Virtual Cable or any paid software needed!**

## What's Different?

### FREE Version (`main_tkinter_free.py`)
- ✅ Uses Windows WASAPI loopback (native Windows API)
- ✅ **No third-party software required**
- ✅ **Completely free** - no paid tools needed
- ✅ Captures system audio directly from Windows
- ✅ Works on Windows 10/11

### Standard Version (`main_tkinter.py`)
- Requires VB-Audio Virtual Cable (free but third-party)
- Or uses Stereo Mix (may not work on all systems)
- More compatible with different audio setups

## Quick Start (FREE Version)

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

**Important:** The free version uses `sounddevice` (already in requirements):
```bash
pip install sounddevice
```

### Step 2: Run the FREE Version
```bash
python main_tkinter_free.py
```

### Step 3: Start Translation
1. The app will automatically use WASAPI loopback
2. Click **"Start Translation"**
3. Play audio on your computer (YouTube, games, etc.)
4. Translations will appear!

## How It Works

The FREE version uses **Windows WASAPI (Windows Audio Session API) Loopback Mode**:
- Captures audio directly from your default output device
- No virtual audio cables needed
- No third-party software installation
- Native Windows functionality

## Requirements

- **Windows 10 or 11** (WASAPI is Windows-only)
- **Python 3.10+**
- **sounddevice library** (`pip install sounddevice`)

## Troubleshooting

### "sounddevice not installed"
```bash
pip install sounddevice
```

### "No audio captured"
1. Make sure audio is actually playing on your computer
2. Check that your default output device is working
3. Try restarting the app
4. Check Windows Sound settings → make sure output device is active

### "Error in WASAPI capture"
- Make sure you're on Windows 10/11
- Try running as administrator
- Check Windows audio drivers are up to date

## Comparison

| Feature | FREE Version | Standard Version |
|---------|-------------|-----------------|
| Third-party software | ❌ None needed | ✅ VB-Audio Virtual Cable |
| Cost | 🆓 Free | 🆓 Free (but requires setup) |
| Setup complexity | ⭐ Easy | ⭐⭐ Medium |
| Compatibility | Windows 10/11 only | All Windows versions |
| Reliability | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Excellent |

## Which Version Should I Use?

**Use FREE Version if:**
- You want zero third-party software
- You're on Windows 10/11
- You want the simplest setup

**Use Standard Version if:**
- You have issues with WASAPI loopback
- You want maximum compatibility
- You don't mind installing VB-Audio Virtual Cable

## Technical Details

The FREE version uses:
- **sounddevice with WASAPI**: Uses sounddevice library with WASAPI host API
- **WASAPI Loopback Mode**: Attempts to capture audio from output devices
- **No third-party software**: Only requires Python libraries

This bypasses the WDM-KS driver issues that affect Stereo Mix on many systems.

## Support

If you encounter issues with the FREE version:
1. Make sure `sounddevice` is installed: `pip install sounddevice`
2. Try enabling "Stereo Mix" in Windows Sound settings (Recording tab)
3. Check Windows audio drivers are up to date
4. Try running as administrator
5. If issues persist, use the standard version with VB-Audio Virtual Cable

---

**Enjoy the FREE version! No paid software required!** 🎉

