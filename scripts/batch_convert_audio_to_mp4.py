#!/usr/bin/env python3
"""
Batch convert all existing .f32pcm audio files to MP4 format.
Run this script to convert all files at once (no watching required).
"""

import sys
import struct
import subprocess
from pathlib import Path
import numpy as np

# Try to import soundfile for WAV conversion
try:
    import soundfile as sf
    HAS_SOUNDFILE = True
except ImportError:
    HAS_SOUNDFILE = False
    print("[WARN] soundfile not installed. Install with: pip install soundfile")
    print("[WARN] Will use ffmpeg directly (may be slower)")

def read_f32pcm(file_path):
    """Read raw float32 PCM file (little-endian)"""
    with open(file_path, 'rb') as f:
        data = f.read()
    
    # Convert bytes to float32 array
    num_samples = len(data) // 4
    if num_samples == 0:
        return None
    audio_data = struct.unpack(f'<{num_samples}f', data)
    return np.array(audio_data, dtype=np.float32)

def convert_to_wav(audio_data, output_path, sample_rate=48000):
    """Convert float32 audio array to WAV file"""
    if HAS_SOUNDFILE:
        # Convert float32 (-1 to 1) to int16 for WAV
        audio_int16 = np.clip(audio_data * 32767, -32768, 32767).astype(np.int16)
        sf.write(str(output_path), audio_int16, sample_rate, subtype='PCM_16')
    else:
        # Fallback: use ffmpeg directly with raw PCM
        temp_pcm = output_path.with_suffix('.raw')
        audio_int16 = np.clip(audio_data * 32767, -32768, 32767).astype(np.int16)
        audio_int16.tofile(str(temp_pcm))
        
        cmd = [
            'ffmpeg',
            '-f', 's16le',
            '-ar', str(sample_rate),
            '-ac', '1',
            '-i', str(temp_pcm),
            '-y',
            str(output_path)
        ]
        try:
            subprocess.run(cmd, capture_output=True, check=True)
            temp_pcm.unlink()
        except Exception as e:
            if temp_pcm.exists():
                temp_pcm.unlink()
            raise

def convert_to_mp4(wav_path, mp4_path):
    """Convert WAV file to MP4 using ffmpeg"""
    cmd = [
        'ffmpeg',
        '-i', str(wav_path),
        '-c:a', 'aac',
        '-b:a', '192k',
        '-y',
        str(mp4_path)
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to convert {wav_path.name} to MP4:")
        print(f"  {e.stderr.decode() if isinstance(e.stderr, bytes) else e.stderr}")
        return False
    except FileNotFoundError:
        print("[ERROR] ffmpeg not found. Please install ffmpeg:")
        print("  Windows: Download from https://ffmpeg.org/download.html")
        print("  Or use: winget install ffmpeg")
        return False

def main():
    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    audio_captures_dir = project_root / "tauri-app" / "audio_captures"
    
    if not audio_captures_dir.exists():
        print(f"[ERROR] Audio captures directory not found: {audio_captures_dir}")
        return 1
    
    # Create output directory
    output_dir = audio_captures_dir / "mp4_output"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all .f32pcm files
    pcm_files = sorted(audio_captures_dir.glob("*.f32pcm"))
    
    if not pcm_files:
        print(f"[INFO] No .f32pcm files found in {audio_captures_dir}")
        return 0
    
    print(f"[INFO] Found {len(pcm_files)} file(s) to convert.")
    print(f"[INFO] Output directory: {output_dir}\n")
    
    converted = 0
    failed = 0
    
    for file_path in pcm_files:
        print(f"[CONVERT] Processing {file_path.name}...")
        
        try:
            # Read raw PCM data
            audio_data = read_f32pcm(file_path)
            
            if audio_data is None or len(audio_data) == 0:
                print(f"  [SKIP] Empty file")
                continue
            
            # Create output filenames
            base_name = file_path.stem
            wav_path = output_dir / f"{base_name}.wav"
            mp4_path = output_dir / f"{base_name}.mp4"
            
            # Skip if already converted
            if mp4_path.exists():
                print(f"  [SKIP] Already converted: {mp4_path.name}")
                continue
            
            # Convert to WAV first
            print(f"  -> Converting to WAV...")
            convert_to_wav(audio_data, wav_path, sample_rate=48000)
            
            # Convert WAV to MP4
            print(f"  -> Converting to MP4...")
            if convert_to_mp4(wav_path, mp4_path):
                print(f"  [OK] Successfully converted to {mp4_path.name}")
                converted += 1
                # Optionally delete WAV file to save space
                # wav_path.unlink()
            else:
                failed += 1
        
        except Exception as e:
            print(f"  [ERROR] Failed: {e}")
            failed += 1
            import traceback
            traceback.print_exc()
        
        print()
    
    print(f"[INFO] Conversion complete!")
    print(f"  Converted: {converted}")
    print(f"  Failed: {failed}")
    print(f"  Output directory: {output_dir}")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())

