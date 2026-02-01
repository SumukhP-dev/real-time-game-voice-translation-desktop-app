"""
Script to download translation models and cache them for offline use
"""
import sys
import os
from pathlib import Path

def _resolve_models_dir():
    """Resolve models dir with priority: env -> project models/translation -> user cache."""
    env_dir = os.environ.get("TRANSLATION_MODELS_DIR")
    project_dir = Path(__file__).resolve().parent.parent / "models" / "translation"
    user_cache_dir = Path.home() / ".csgo2_translation" / "models"
    if env_dir:
        return Path(env_dir)
    if project_dir.exists():
        return project_dir
    return user_cache_dir


def download_translation_model(target_language="es"):
    """
    Download translation model for target language
    
    Args:
        target_language: Target language code (es, fr, de, ru, etc.)
    """
    try:
        from transformers import MarianMTModel, MarianTokenizer
        import torch
    except ImportError:
        print("[ERROR] transformers library not installed.")
        print("[ERROR] Install with: pip install transformers torch")
        return False
    
    # Model mapping
    model_map = {
        "en": "Helsinki-NLP/opus-mt-mul-en",  # Multi-lingual to English
        "es": "Helsinki-NLP/opus-mt-en-es",  # English to Spanish
        "fr": "Helsinki-NLP/opus-mt-en-fr",  # English to French
        "de": "Helsinki-NLP/opus-mt-en-de",  # English to German
        "ru": "Helsinki-NLP/opus-mt-en-ru",  # English to Russian
        "zh": "Helsinki-NLP/opus-mt-en-zh",  # English to Chinese
        "ja": "Helsinki-NLP/opus-mt-en-ja",  # English to Japanese (short id)
        "ko": "Helsinki-NLP/opus-mt-tc-big-en-ko",  # English to Korean (short id 404s)
        "pt": "Helsinki-NLP/opus-mt-tc-big-en-pt",  # English to Portuguese (short id 404s)
        "it": "Helsinki-NLP/opus-mt-en-it",  # English to Italian
        "ar": "Helsinki-NLP/opus-mt-en-ar",  # English to Arabic
        "hi": "Helsinki-NLP/opus-mt-en-hi",  # English to Hindi
        "tr": "Helsinki-NLP/opus-mt-en-tr",  # English to Turkish
        "pl": "Helsinki-NLP/opus-mt-en-pl",  # English to Polish
        "uk": "Helsinki-NLP/opus-mt-en-uk"   # English to Ukrainian
    }
    
    if target_language not in model_map:
        print(f"[ERROR] Unsupported target language: {target_language}")
        print(f"[INFO] Supported languages: {', '.join(model_map.keys())}")
        return False
    
    model_name = model_map[target_language]
    
    # Models directory (same as used by Translator)
    models_dir = _resolve_models_dir()
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("Translation Model Downloader")
    print("=" * 60)
    print(f"Target language: {target_language}")
    print(f"Model: {model_name}")
    print(f"Cache directory: {models_dir}")
    print("=" * 60)
    print()
    
    try:
        print(f"[INFO] Downloading model '{model_name}'...")
        print(f"[INFO] This may take several minutes depending on your internet connection...")
        print()
        
        # Download model (will be cached automatically)
        print("[INFO] Downloading model weights...")
        model = MarianMTModel.from_pretrained(
            model_name,
            cache_dir=str(models_dir),
            local_files_only=False
        )
        print("[OK] Model downloaded successfully")
        
        print("[INFO] Downloading tokenizer...")
        tokenizer = MarianTokenizer.from_pretrained(
            model_name,
            cache_dir=str(models_dir),
            local_files_only=False
        )
        print("[OK] Tokenizer downloaded successfully")
        
        # Test the model
        print("[INFO] Testing model...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)
        
        # Simple test translation
        test_text = "Hello, how are you?"
        inputs = tokenizer(test_text, return_tensors="pt", padding=True).to(device)
        translated = model.generate(**inputs)
        translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
        
        print(f"[OK] Test translation: '{test_text}' -> '{translated_text}'")
        print()
        
        print("=" * 60)
        print("[SUCCESS] Model download and test complete!")
        print("=" * 60)
        print(f"[INFO] Model cached at: {models_dir}")
        print(f"[INFO] The model will be automatically loaded when needed")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print()
        print("=" * 60)
        print(f"[ERROR] Failed to download model: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return False

def download_all_models():
    """Download all available translation models"""
    model_map = {
        "es": "Helsinki-NLP/opus-mt-en-es",
        "fr": "Helsinki-NLP/opus-mt-en-fr",
        "de": "Helsinki-NLP/opus-mt-en-de",
        "ru": "Helsinki-NLP/opus-mt-en-ru",
        "zh": "Helsinki-NLP/opus-mt-en-zh",
        "ja": "Helsinki-NLP/opus-mt-en-ja",
        "ko": "Helsinki-NLP/opus-mt-tc-big-en-ko",
        "pt": "Helsinki-NLP/opus-mt-tc-big-en-pt",
        "it": "Helsinki-NLP/opus-mt-en-it",
    }
    
    print("=" * 60)
    print("Downloading All Translation Models")
    print("=" * 60)
    print(f"This will download {len(model_map)} models.")
    print("This may take a long time depending on your internet connection.")
    print("=" * 60)
    print()
    
    success_count = 0
    for lang_code in model_map.keys():
        print(f"\n[{success_count + 1}/{len(model_map)}] Downloading {lang_code}...")
        if download_translation_model(lang_code):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"[COMPLETE] Downloaded {success_count}/{len(model_map)} models")
    print("=" * 60)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--all":
            download_all_models()
        else:
            target_lang = sys.argv[1]
            success = download_translation_model(target_lang)
            sys.exit(0 if success else 1)
    else:
        print("Usage:")
        print(f"  python {sys.argv[0]} <language_code>  # Download model for specific language")
        print(f"  python {sys.argv[0]} --all              # Download all models")
        print()
        print("Examples:")
        print(f"  python {sys.argv[0]} es  # Download Spanish translation model")
        print(f"  python {sys.argv[0]} fr  # Download French translation model")
        print()
        print("Supported languages: es, fr, de, ru, zh, ja, ko, pt, it, ar, hi, tr, pl, uk")
        sys.exit(1)
