# Complete VB-Audio Virtual Cable Setup Guide

## Why You Need This

If you're seeing errors like:
- `Error opening InputStream: Invalid device [PaErrorCode -9996]`
- `⚠ Skipping WDM-KS Stereo Mix - not accessible`
- App falling back to microphone instead of system audio

This means your Stereo Mix is on a WDM-KS driver that PortAudio cannot access. **VB-Audio Virtual Cable solves this problem completely.**

## Step-by-Step Installation & Setup

### Step 1: Download VB-Audio Virtual Cable

1. Go to: **https://vb-audio.com/Cable/**
2. Click **"Download"** (free version)
3. Download the Windows installer

### Step 2: Install

1. Run the installer (`VBCABLE_Setup.exe`)
2. Follow the installation wizard
3. **Restart your computer** (important!)

### Step 3: Configure Windows Audio

#### Option A: Set as Default Playback Device (Easiest)

1. **Right-click** the speaker icon in your system tray (bottom-right)
2. Select **"Sounds"** or **"Sound settings"**
3. Go to the **"Playback"** tab
4. Find **"CABLE Input (VB-Audio Virtual Cable)"**
5. **Right-click** on it → **"Set as Default Device"**
6. **Right-click** again → **"Set as Default Communication Device"** (optional)

**Result:** All system audio will now go through the virtual cable.

#### Option B: Route Specific Apps (Advanced)

If you only want to capture game audio, not all system audio:

1. Keep your normal speakers/headphones as default
2. In your game (CS:GO 2), go to audio settings
3. Set the game's audio output to **"CABLE Input"**
4. This way only game audio goes to the virtual cable

### Step 4: Configure the Translation App

1. **Open** the CS:GO 2 Live Translation Mod app
2. In the **"Audio Device"** dropdown, look for:
   - **"CABLE Input (VB-Audio Virtual Cable)"** or
   - **"CABLE Input"** or
   - Any device with "CABLE" in the name
3. **Select** the CABLE Input device
4. Click **"Start Translation"**

### Step 5: Test It

1. Play a YouTube video with speech (or start your game)
2. You should see transcriptions appearing in the app log
3. The app will translate any non-English speech
4. Subtitles will appear on screen (if overlay enabled)

## Verification Checklist

- [ ] VB-Audio Virtual Cable installed
- [ ] Computer restarted after installation
- [ ] CABLE Input visible in Windows Sound settings
- [ ] CABLE Input selected in the translation app
- [ ] Audio is playing (YouTube, game, etc.)
- [ ] Transcriptions appearing in app log

## Troubleshooting

### "CABLE Input" not showing in app dropdown?

1. **Restart the app** after installing VB-Audio Virtual Cable
2. Check Windows Sound settings → Recording tab → Is "CABLE Output" visible?
3. If not, reinstall VB-Audio Virtual Cable and restart

### Still no audio captured?

1. **Verify audio is playing**: Check your system volume
2. **Check device selection**: Make sure "CABLE Input" is selected in the app
3. **Check Windows routing**: 
   - If CABLE Input is default playback → all audio should go there
   - If not default → make sure your app/game is routed to CABLE Input
4. **Test with microphone first**: Select your mic to verify the app works

### Audio is captured but no sound from speakers?

This is normal! When CABLE Input is your default playback device:
- Audio goes to the virtual cable (for capture)
- You won't hear it through speakers

**Solution:** Use a second audio device for playback:
1. Keep CABLE Input as default (for capture)
2. Connect headphones/speakers to a different audio output
3. OR use VB-Audio Virtual Cable's loopback feature

### Want to hear audio AND capture it?

**Option 1: Use two audio devices**
- CABLE Input: For capture (default playback)
- Headphones/Speakers: For listening (separate device)

**Option 2: Use VB-Audio Virtual Cable + Audio Router**
- Route game to CABLE Input (for capture)
- Route game to speakers (for listening)
- Requires audio routing software

## How It Works

```
Game/System Audio
       ↓
CABLE Input (Virtual Cable) ← Translation App captures from here
       ↓
CABLE Output (Virtual Cable) ← Optional: Route to speakers
```

The virtual cable creates a "pipe" that audio flows through. The translation app taps into this pipe to capture the audio.

## Alternative: Stereo Mix (If Available)

If your Stereo Mix works (not on WDM-KS), you can use it instead:
1. Enable Stereo Mix in Windows Sound settings
2. Select "Stereo Mix" in the translation app
3. No virtual cable needed

**But:** Most modern Windows systems have Stereo Mix on WDM-KS, which is why VB-Audio Virtual Cable is recommended.

## Summary

✅ **Install VB-Audio Virtual Cable** → Restart → Set as default → Select in app → Done!

This is the **most reliable** way to capture system audio on Windows.

