# Voice Translation Setup Guide

## Overview

Voice Translation translates your microphone speech to teammates' languages in real time. **Incoming** game/teammate audio uses **WASAPI loopback** (no virtual audio cable required on Windows 10/11).

## Prerequisites

1. **Microphone** for your voice input
2. **Windows 10/11** for WASAPI loopback of game audio
3. **Virtual microphone** (optional) if you want translated voice routed into the game's mic input

## Capture game / teammate audio (WASAPI)

1. Open the app → **Audio Settings**
2. Select your **headphones or speakers** (device name includes **WASAPI loopback**)
3. Click **Start Capture**
4. Play game voice chat and confirm non-zero RMS in status logs

## Translate your voice to teammates

1. Enable voice translation in settings
2. Choose target language mode (auto-detect, manual, or match teammates)
3. In your game's voice chat settings, select your **virtual microphone** device if using routed output
4. Speak into your physical microphone; translated audio is sent per your output configuration

## Troubleshooting

- **No capture / RMS=0**: Wrong device selected — pick WASAPI loopback for your headphones/speakers
- **No subtitles**: Check overlay enabled, ML service on port 8000, and that speech is detected
- **Voice out not heard in game**: Confirm the game mic is set to the virtual microphone device

See also: `AUDIO_DEVICE_GUIDE.md`, `AUDIO_SETUP_GUIDE.md`
