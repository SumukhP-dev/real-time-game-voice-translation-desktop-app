"""
Script to download Whisper model and save it to the project's models directory
"""
import sys
import os
from pathlib import Path
import whisper
import shutil

def download_whisper_model(model_name="small"):
    """
    Download Whisper model and save it to the project's models directory
    
    Args:
        model_name: Name of the Whisper model to download (tiny, base, small, medium, large)
    """
    # Get project root (assuming this script is in scripts/)
    project_root = Path(__file__).parent.parent
    models_dir = project_root / "models" / "whisper"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    local_model_path = models_dir / model_name
    
    print(f"Downloading Whisper model: {model_name}")
    print(f"Target directory: {local_model_path}")
    
    try:
        # Load model (this will download it if not cached)
        print(f"Loading model '{model_name}' (this may take a while on first download)...")
        model = whisper.load_model(model_name)
        print(f"[OK] Model '{model_name}' loaded successfully")
        
        # Get Whisper's cache directory
        cache_dir = Path.home() / ".cache" / "whisper"
        cached_model_path = cache_dir / f"{model_name}.pt"
        
        if cached_model_path.exists():
            print(f"Found cached model at: {cached_model_path}")
            print(f"Copying to local directory: {local_model_path}")
            
            # Create local model directory
            local_model_path.mkdir(parents=True, exist_ok=True)
            
            # Copy the model file
            target_file = local_model_path / f"{model_name}.pt"
            shutil.copy2(cached_model_path, target_file)
            
            print(f"[OK] Model saved to: {target_file}")
            print(f"[OK] Model is now available locally and will be used by the app")
        else:
            print(f"[WARN] Could not find cached model at {cached_model_path}")
            print(f"[INFO] Model may be stored in a different location")
            print(f"[INFO] The app will still work, but may need to download the model again")
        
    except Exception as e:
        print(f"[ERROR] Failed to download model: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    # Get model name from command line or use default
    model_name = sys.argv[1] if len(sys.argv) > 1 else "small"
    
    print("=" * 60)
    print("Whisper Model Downloader")
    print("=" * 60)
    print(f"Model: {model_name}")
    print(f"Available models: tiny, base, small, medium, large")
    print("=" * 60)
    print()
    
    success = download_whisper_model(model_name)
    
    if success:
        print()
        print("=" * 60)
        print("[SUCCESS] Model download complete!")
        print("=" * 60)
        sys.exit(0)
    else:
        print()
        print("=" * 60)
        print("[ERROR] Model download failed!")
        print("=" * 60)
        sys.exit(1)

