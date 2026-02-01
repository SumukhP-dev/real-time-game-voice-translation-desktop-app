#!/usr/bin/env python3
"""
Automatically convert raw .f32pcm audio files to MP4 format.
Watches the audio_captures directory and converts new files as they appear.
"""

import os
import sys
import time
import struct
import subprocess
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import numpy as np

# Try to import soundfile for WAV conversion
try:
    import soundfile as sf
    HAS_SOUNDFILE = True
except ImportError:
    HAS_SOUNDFILE = False
    print("[WARN] soundfile not installed. Install with: pip install soundfile")
    print("[WARN] Will use ffmpeg directly (may be slower)")

class AudioConverter:
    def __init__(self, input_dir, output_dir=None, sample_rate=48000):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir) if output_dir else self.input_dir / "mp4_output"
        self.sample_rate = sample_rate
        self.converted_files = set()
        
        # Create output directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Convert existing files on startup
        self.convert_existing_files()
    
    def read_f32pcm(self, file_path):
        """Read raw float32 PCM file (little-endian)"""
        with open(file_path, 'rb') as f:
            data = f.read()
        
        # Convert bytes to float32 array
        # Each float32 is 4 bytes, little-endian
        num_samples = len(data) // 4
        audio_data = struct.unpack(f'<{num_samples}f', data)
        return np.array(audio_data, dtype=np.float32)
    
    def convert_to_wav(self, audio_data, output_path):
        """Convert float32 audio array to WAV file"""
        if HAS_SOUNDFILE:
            # Convert float32 (-1 to 1) to int16 for WAV
            audio_int16 = np.clip(audio_data * 32767, -32768, 32767).astype(np.int16)
            sf.write(str(output_path), audio_int16, self.sample_rate, subtype='PCM_16')
        else:
            # Fallback: use ffmpeg directly with raw PCM
            # Write raw PCM to temporary file
            temp_pcm = output_path.with_suffix('.raw')
            audio_int16 = np.clip(audio_data * 32767, -32768, 32767).astype(np.int16)
            audio_int16.tofile(str(temp_pcm))
            
            # Convert to WAV using ffmpeg
            cmd = [
                'ffmpeg',
                '-f', 's16le',  # 16-bit signed little-endian
                '-ar', str(self.sample_rate),
                '-ac', '1',  # mono
                '-i', str(temp_pcm),
                '-y',  # Overwrite output file
                str(output_path)
            ]
            subprocess.run(cmd, capture_output=True, check=True)
            temp_pcm.unlink()  # Delete temp file
    
    def convert_to_mp4(self, wav_path, mp4_path):
        """Convert WAV file to MP4 using ffmpeg"""
        cmd = [
            'ffmpeg',
            '-i', str(wav_path),
            '-c:a', 'aac',  # AAC audio codec
            '-b:a', '192k',  # Audio bitrate
            '-y',  # Overwrite output file
            str(mp4_path)
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"[ERROR] Failed to convert {wav_path} to MP4:")
            print(f"  {e.stderr}")
            return False
        except FileNotFoundError:
            print("[ERROR] ffmpeg not found. Please install ffmpeg:")
            print("  Windows: Download from https://ffmpeg.org/download.html")
            print("  Or use: winget install ffmpeg")
            return False
    
    def convert_file(self, file_path):
        """Convert a single .f32pcm file to MP4"""
        file_path = Path(file_path)
        
        if file_path.suffix != '.f32pcm':
            return
        
        if file_path in self.converted_files:
            return
        
        print(f"[CONVERT] Processing {file_path.name}...")
        
        try:
            # Read raw PCM data
            audio_data = self.read_f32pcm(file_path)
            
            if len(audio_data) == 0:
                print(f"[SKIP] Empty file: {file_path.name}")
                return
            
            # Create output filenames
            base_name = file_path.stem
            wav_path = self.output_dir / f"{base_name}.wav"
            mp4_path = self.output_dir / f"{base_name}.mp4"
            
            # Convert to WAV first
            print(f"  → Converting to WAV...")
            self.convert_to_wav(audio_data, wav_path)
            
            # Convert WAV to MP4
            print(f"  → Converting to MP4...")
            if self.convert_to_mp4(wav_path, mp4_path):
                print(f"  ✓ Successfully converted to {mp4_path.name}")
                self.converted_files.add(file_path)
                # Optionally delete WAV file to save space
                # wav_path.unlink()
            else:
                print(f"  ✗ Failed to convert to MP4")
        
        except Exception as e:
            print(f"[ERROR] Failed to convert {file_path.name}: {e}")
            import traceback
            traceback.print_exc()
    
    def convert_existing_files(self):
        """Convert all existing .f32pcm files in the input directory"""
        print(f"[INFO] Scanning for existing .f32pcm files in {self.input_dir}...")
        pcm_files = list(self.input_dir.glob("*.f32pcm"))
        
        if not pcm_files:
            print("[INFO] No existing .f32pcm files found.")
            return
        
        print(f"[INFO] Found {len(pcm_files)} file(s) to convert.")
        for file_path in sorted(pcm_files):
            self.convert_file(file_path)
        print("[INFO] Finished converting existing files.\n")


class AudioFileHandler(FileSystemEventHandler):
    def __init__(self, converter):
        self.converter = converter
    
    def on_created(self, event):
        if not event.is_directory:
            file_path = Path(event.src_path)
            if file_path.suffix == '.f32pcm':
                # Wait a moment for file to be fully written
                time.sleep(0.5)
                self.converter.convert_file(file_path)


def main():
    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    audio_captures_dir = project_root / "tauri-app" / "audio_captures"
    
    if not audio_captures_dir.exists():
        print(f"[ERROR] Audio captures directory not found: {audio_captures_dir}")
        print("[INFO] Creating directory...")
        audio_captures_dir.mkdir(parents=True, exist_ok=True)
    
    # Create converter
    converter = AudioConverter(
        input_dir=audio_captures_dir,
        sample_rate=48000  # Default sample rate from the app
    )
    
    # Set up file watcher
    event_handler = AudioFileHandler(converter)
    observer = Observer()
    observer.schedule(event_handler, str(audio_captures_dir), recursive=False)
    observer.start()
    
    print(f"[INFO] Watching {audio_captures_dir} for new .f32pcm files...")
    print("[INFO] Press Ctrl+C to stop.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[INFO] Stopping watcher...")
        observer.stop()
    
    observer.join()
    print("[INFO] Converter stopped.")


if __name__ == "__main__":
    main()

