"""
Translation service
Refactored from src/core/translation/translator.py
"""
import sys
import os
import json
import re
import threading
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

try:
    from utils.safe_print import safe_print
except ImportError:
    def safe_print(*args, **kwargs):

        print(*args, **kwargs)

# Import torch conditionally
try:
    import torch
except ImportError:
    torch = None

class TranslationService:

    """Translation service using EasyNMT or transformers"""

    def __init__(
        self,
        target_language: str = "en",
        model_type: str = "local",
        model_name: str = "opus-mt",
        use_fallback: bool = True,
        models_dir: Optional[str] = None
    ):
        """
        Initialize translation service

        Args:
            target_language: Target language code (e.g., 'en', 'es', 'ru')
            model_type: 'local' or 'api'
            model_name: Model name ('opus-mt', 'nllb', 'easynmt')
            use_fallback: Use API fallback if local fails
            models_dir: Directory to store models
        """
        self.target_language = target_language
        self.model_type = model_type
        self.model_name = model_name
        self.use_fallback = use_fallback

        # Model storage directory
        if models_dir:
            self.models_dir = Path(models_dir)
        else:
            from app_paths import get_models_dir

            self.models_dir = get_models_dir()

        self.models_dir.mkdir(parents=True, exist_ok=True)

        # Initialize translators (lazy loading)
        self.local_translator = None
        self.fallback_translator = None
        self._model_loading = False
        self._model_loaded = False
        self._initialization_attempted = False

        # Translation cache
        self.translation_cache = {}
        self.cache_lock = threading.Lock()
        self.tactical_rules = self._load_tactical_rules()

    def _load_tactical_rules(self) -> Dict[str, Any]:

        rules_path = Path(__file__).resolve().parent / "data" / "tactical_terms.json"
        try:
            with rules_path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            safe_print(f"[WARN] Tactical rules unavailable: {e}", flush=True)
            return {}

    def _apply_regex_replacements(self, text: str, replacements: list[dict]) -> str:

        updated = text
        for rule in replacements:
            pattern = rule.get("pattern")
            replacement = rule.get("replacement", "")
            if not pattern:
                continue
            updated = re.sub(pattern, replacement, updated, flags=re.IGNORECASE)
        return updated

    def _strip_fillers(self, text: str, fillers: list[str]) -> str:

        updated = text
        for filler in fillers:
            token = (filler or "").strip()
            if not token:
                continue
            if re.search(r"[A-Za-z0-9]", token):
                updated = re.sub(
                    rf"\b{re.escape(token)}\b[\s,]*",
                    "",
                    updated,
                    flags=re.IGNORECASE,
                )
            else:
                updated = updated.replace(token, "")
        return updated

    def _clean_tactical_text(self, text: str) -> str:

        text = re.sub(r"[ \t]+", " ", text).strip()
        text = re.sub(r"\s+([,.;:!?])", r"\1", text)
        text = re.sub(r"([!?.,])\1+", r"\1", text)
        text = re.sub(r"\s{2,}", " ", text)
        return text.strip(" ,")

    def _normalize_tactical_source(self, text: str) -> str:

        normalized = (text or "").strip()
        if not normalized:
            return ""

        normalized = self._apply_regex_replacements(
            normalized,
            self.tactical_rules.get("source_replacements", []),
        )
        normalized = self._strip_fillers(
            normalized,
            self.tactical_rules.get("generic_fillers", []),
        )
        return self._clean_tactical_text(normalized)

    def _compress_tactical_output(
        self,
        text: str,
        target_language: Optional[str],
    ) -> str:

        compressed = (text or "").strip()
        if not compressed:
            return ""

        compressed = self._apply_regex_replacements(
            compressed,
            self.tactical_rules.get("generic_output_replacements", []),
        )
        compressed = self._apply_regex_replacements(
            compressed,
            self.tactical_rules.get("language_output_replacements", {}).get(
                (target_language or "").lower(),
                [],
            ),
        )
        compressed = self._strip_fillers(
            compressed,
            self.tactical_rules.get("generic_fillers", []),
        )
        compressed = self._strip_fillers(
            compressed,
            self.tactical_rules.get("language_fillers", {}).get(
                (target_language or "").lower(),
                [],
            ),
        )
        return self._clean_tactical_text(compressed) or text.strip()

    def _initialize_local_model(self):

        """Initialize local translation model"""
        try:
            safe_print(f"[INFO] Initializing local translation model ({self.model_name})...", flush=True)
            self._model_loading = True

            # Try EasyNMT first
            try:
                from EasyNMT import EasyNMT

                model_name = "opus-mt"
                if self.model_name == "nllb":
                    model_name = "nllb-200-distilled-600M"
                elif self.model_name == "easynmt":
                    model_name = "opus-mt"

                safe_print(f"[INFO] Loading model: {model_name}...", flush=True)
                self.local_translator = EasyNMT(model_name, cache_folder=str(self.models_dir))
                self._model_loaded = True
                self._model_loading = False
                safe_print(f"[OK] Local translator initialized", flush=True)

            except ImportError:
                safe_print("[WARN] EasyNMT not available, trying transformers...", flush=True)
                # Fallback to transformers
                try:
                    from transformers import MarianMTModel, MarianTokenizer
                    import torch

                    model_map = {
                        "en": "Helsinki-NLP/opus-mt-mul-en",
                        "es": "Helsinki-NLP/opus-mt-mul-es",
                        "fr": "Helsinki-NLP/opus-mt-mul-fr",
                        "de": "Helsinki-NLP/opus-mt-mul-de",
                        "ru": "Helsinki-NLP/opus-mt-mul-ru",
                        "zh": "Helsinki-NLP/opus-mt-mul-zh",
                        "ja": "Helsinki-NLP/opus-mt-mul-ja",
                        "ko": "Helsinki-NLP/opus-mt-mul-ko",
                        "pt": "Helsinki-NLP/opus-mt-mul-pt",
                        "it": "Helsinki-NLP/opus-mt-mul-it",
                        "ar": "Helsinki-NLP/opus-mt-mul-ar",
                        "hi": "Helsinki-NLP/opus-mt-mul-hi",
                        "tr": "Helsinki-NLP/opus-mt-mul-tr",
                        "pl": "Helsinki-NLP/opus-mt-mul-pl",
                        "uk": "Helsinki-NLP/opus-mt-mul-uk"
                    }

                    model_name = model_map.get(self.target_language, "Helsinki-NLP/opus-mt-mul-en")
                    safe_print(f"[INFO] Loading transformers model: {model_name}...", flush=True)

                    self.local_translator = {
                        "model": MarianMTModel.from_pretrained(model_name, cache_dir=str(self.models_dir)),
                        "tokenizer": MarianTokenizer.from_pretrained(model_name, cache_dir=str(self.models_dir)),
                        "device": "cuda" if torch and torch.cuda.is_available() else "cpu"
                    }

                    if self.local_translator["device"] == "cuda":
                        self.local_translator["model"] = self.local_translator["model"].to("cuda")

                    self._model_loaded = True
                    self._model_loading = False
                    safe_print(f"[OK] Local translator initialized", flush=True)

                except ImportError:
                    safe_print("[ERROR] Neither EasyNMT nor transformers available", flush=True)
                    self.local_translator = None
                    self._model_loading = False
                    if self.use_fallback:
                        self._initialize_api_translator()

            except Exception as e:
                safe_print(f"[ERROR] Error initializing local model: {e}", flush=True)
                self.local_translator = None
                self._model_loading = False
                if self.use_fallback:
                    self._initialize_api_translator()

        except Exception as e:
            safe_print(f"[ERROR] Unexpected error: {e}", flush=True)
            self.local_translator = None
            self._model_loading = False
            if self.use_fallback:
                self._initialize_api_translator()

    def _initialize_api_translator(self):

        """Initialize API-based translator (fallback)"""
        try:
            from deep_translator import GoogleTranslator
            # Initialize with auto-detect source, will be overridden per-translation if needed
            self.fallback_translator = GoogleTranslator(source='auto', target=self.target_language)
            safe_print(f"[OK] API translator initialized (target: {self.target_language})", flush=True)
        except ImportError as e:
            safe_print(f"[ERROR] deep_translator not available: {e}", flush=True)
            safe_print("[INFO] Install with: pip install deep-translator", flush=True)
            self.fallback_translator = None
        except Exception as e:
            safe_print(f"[ERROR] Error initializing API translator: {e}", flush=True)
            import traceback
            safe_print(f"[ERROR] Traceback: {traceback.format_exc()}", flush=True)
            self.fallback_translator = None

    def _ensure_initialized(self):

        """Ensure translator is initialized (lazy loading)"""
        if self._initialization_attempted:
            return

        self._initialization_attempted = True

        if self.model_type == "local":
            self._initialize_local_model()
        else:
            self._initialize_api_translator()

    def translate(
        self,
        text: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Translate text to target language

        Args:
            text: Text to translate
            source_language: Source language code (None for auto-detect)

        Returns:
            Dict with 'translated_text', 'source_language', 'target_language'
        """
        if not text or len(text.strip()) == 0:
            return {
                "translated_text": "",
                "source_language": source_language or "unknown",
                "target_language": self.target_language
            }

        original_text = text.strip()
        normalized_text = self._normalize_tactical_source(original_text) or original_text

        cache_key = f"{normalized_text}_{source_language}_{self.target_language}"
        with self.cache_lock:
            if cache_key in self.translation_cache:
                return self.translation_cache[cache_key]

        # Same language: return immediately without loading translation models.
        if source_language and source_language not in ("auto", "unknown"):
            if source_language == self.target_language:
                safe_print(
                    f"[INFO] Source and target languages match ({source_language}), returning original text",
                    flush=True,
                )
                result = {
                    "translated_text": original_text,
                    "source_language": source_language,
                    "target_language": self.target_language,
                }
                with self.cache_lock:
                    self.translation_cache[cache_key] = result
                return result

        # Lazy initialization (only when translation may be needed)
        self._ensure_initialized()

        # Wait for model loading
        if self._model_loading:
            import time
            timeout = 60
            start_time = time.time()
            while self._model_loading and (time.time() - start_time) < timeout:
                time.sleep(0.5)

        try:
            # Try local translation first
            translated = None
            if self.model_type == "local" and self.local_translator and self._model_loaded:
                safe_print(
                    f"[INFO] Attempting local translation: {normalized_text[:50]}...",
                    flush=True,
                )
                translated = self._translate_with_local(normalized_text, source_language)
                if translated:
                    safe_print(f"[OK] Local translation: {translated[:50]}...", flush=True)
                else:
                    safe_print("[WARN] Local translation returned None", flush=True)

            # Fallback to API if local translation failed or returned same text
            if translated is None or translated == text:
                if self.use_fallback:
                    # Ensure API translator is initialized
                    if not self.fallback_translator:
                        safe_print("[INFO] Initializing API translator for fallback...", flush=True)
                        self._initialize_api_translator()

                    if self.fallback_translator:
                        safe_print(f"[INFO] Using API fallback for: {normalized_text[:50]}... (source: {source_language}, target: {self.target_language})", flush=True)
                        api_translated = self._translate_with_api(normalized_text, source_language)
                        if api_translated and api_translated != normalized_text:
                            translated = api_translated
                            safe_print(f"[OK] API translation: '{translated[:50]}...'", flush=True)
                        else:
                            safe_print("[WARN] API translation returned None or same text", flush=True)
                    else:
                        safe_print("[WARN] Failed to initialize API translator", flush=True)
                else:
                    safe_print("[WARN] Fallback disabled, no translation available", flush=True)

            if translated is None:
                safe_print(f"[WARN] All translation methods failed, returning original text", flush=True)
                translated = normalized_text

            translated = self._compress_tactical_output(
                translated,
                self.target_language,
            )

            result = {
                "translated_text": translated,
                "source_language": source_language or "unknown",
                "target_language": self.target_language
            }

            # Cache result
            with self.cache_lock:
                self.translation_cache[cache_key] = result

            return result

        except Exception as e:
            safe_print(f"[ERROR] Error translating: {e}", flush=True)
            return {
                "translated_text": text,
                "source_language": source_language or "unknown",
                "target_language": self.target_language,
                "error": str(e)
            }

    def _translate_with_local(self, text: str, source_language: Optional[str] = None) -> Optional[str]:

        """Translate using local model"""
        if not self.local_translator or not self._model_loaded:
            return None

        try:
            # EasyNMT
            if hasattr(self.local_translator, 'translate'):
                if source_language and source_language != "auto" and source_language != "unknown":
                    return self.local_translator.translate(text, source_lang=source_language, target_lang=self.target_language)
                else:
                    return self.local_translator.translate(text, target_lang=self.target_language)

            # Transformers
            elif isinstance(self.local_translator, dict) and "model" in self.local_translator:
                if torch is None:
                    return None

                tokenizer = self.local_translator["tokenizer"]
                model = self.local_translator["model"]
                device = self.local_translator["device"]

                inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
                inputs = {k: v.to(device) for k, v in inputs.items()}

                with torch.no_grad():
                    translated_tokens = model.generate(**inputs, max_length=512)

                return tokenizer.decode(translated_tokens[0], skip_special_tokens=True)

        except Exception as e:
            safe_print(f"[ERROR] Local translation error: {e}", flush=True)
            return None

        return None

    def _translate_with_api(self, text: str, source_language: Optional[str] = None) -> Optional[str]:

        """Translate using API (fallback)"""
        if not self.fallback_translator:
            return None

        try:
            # If source language is specified and different from target, use it
            if source_language and source_language != "auto" and source_language != "unknown":
                # Recreate translator with specific source language
                from deep_translator import GoogleTranslator
                translator = GoogleTranslator(source=source_language, target=self.target_language)
                result = translator.translate(text)
            else:
                # Use auto-detect
                result = self.fallback_translator.translate(text)

            # Validate result
            if result and result.strip() and result != text:
                # Remove any extra quotes that might be added
                result = result.strip().strip('"').strip("'")
                return result
            elif result == text:
                # Translation returned same text - might be same language or error
                safe_print(f"[WARN] API translation returned same text: '{text}'", flush=True)
                return None
            else:
                safe_print(f"[WARN] API translation returned empty or invalid result", flush=True)
                return None

        except Exception as e:
            safe_print(f"[ERROR] API translation error: {e}", flush=True)
            import traceback
            safe_print(f"[ERROR] Traceback: {traceback.format_exc()}", flush=True)
            return None

    def set_target_language(self, language_code: str):

        """Change target language"""
        if language_code != self.target_language:
            self.target_language = language_code
            with self.cache_lock:
                self.translation_cache.clear()

            # Reinitialize API translator with new target language
            try:
                from deep_translator import GoogleTranslator
                self.fallback_translator = GoogleTranslator(source='auto', target=self.target_language)
                safe_print(f"[OK] API translator updated (target: {self.target_language})", flush=True)
            except Exception as e:
                safe_print(f"[WARN] Could not update API translator: {e}", flush=True)
                self.fallback_translator = None
