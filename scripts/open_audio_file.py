"""
Quick script to open audio files for listening
Usage: python scripts/open_audio_file.py [filename]
"""
import os
import sys
import subprocess
from pathlib import Path

def open_audio_file(filename=None):
    """Open an audio file in the default system player"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    audio_dir = project_root / "audio"
    
    if not audio_dir.exists():
        print(f"Audio directory not found: {audio_dir}")
        return
    
    if filename:
        # Try to find the file
        filepath = audio_dir / filename
        if not filepath.exists():
            # Try without extension
            filepath = audio_dir / f"{filename}.wav"
        if not filepath.exists():
            print(f"File not found: {filename}")
            return
    else:
        # Get most recent file
        audio_files = sorted(audio_dir.glob("captured_audio_*.wav"))
        if not audio_files:
            print("No audio files found")
            return
        filepath = audio_files[-1]  # Most recent
        print(f"Opening most recent file: {filepath.name}")
    
    # Open with default system player
    try:
        if sys.platform == "win32":
            os.startfile(str(filepath))
        elif sys.platform == "darwin":
            subprocess.run(["open", str(filepath)])
        else:
            subprocess.run(["xdg-open", str(filepath)])
        print(f"Opened: {filepath}")
    except Exception as e:
        print(f"Error opening file: {e}")
        print(f"File location: {filepath}")
        print("You can manually open it in your audio player.")

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else None
    open_audio_file(filename)

