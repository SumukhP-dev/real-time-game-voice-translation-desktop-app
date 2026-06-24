"""
Whisper speech recognition service
Refactored from src/core/speech/recognizer.py
"""
import sys
import os
import re
import time
import numpy as np
from scipy import signal
from pathlib import Path
from typing import Optional, List, Dict, Any
import tempfile
try:
    import soundfile as sf
    SOUNDFILE_AVAILABLE = True
except ImportError:
    SOUNDFILE_AVAILABLE = False
    print("[WARN] soundfile not available, file-based fallback will not work")

try:
    import torch

    TORCH_AVAILABLE = True
except ImportError:
    torch = None  # type: ignore
    TORCH_AVAILABLE = False

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

# Use standard print instead of safe_print
def safe_print(*args, **kwargs):

    print(*args, **kwargs)

class WhisperService:

    """Whisper speech recognition service"""

    def __init__(self, model_name: str = "tiny", models_dir: Optional[str] = None):

        """
        Initialize Whisper service

        Args:
            model_name: Whisper model name (tiny, base, small, medium, large)
            models_dir: Directory to store models (default: project_root/models/whisper)
        """
        self.model_name = model_name
        self.model = None
        self.model_loaded = False
        self.sample_rate = 16000

        # Setup model directory
        if models_dir:
            self.models_dir = Path(models_dir)
        else:
            from app_paths import get_models_dir

            self.models_dir = get_models_dir() / "whisper"

        self.models_dir.mkdir(parents=True, exist_ok=True)

    def load_model(self):

        """Load Whisper model (lazy loading)"""
        if self.model_loaded and self.model is not None:
            return

        import whisper  # defer heavy import until first use

        safe_print(f"Loading Whisper model: {self.model_name}...", flush=True)
        try:
            # Try to load from local models directory first
            local_model_file = self.models_dir / self.model_name / f"{self.model_name}.pt"
            if local_model_file.exists():
                safe_print(f"[INFO] Loading model from local directory: {local_model_file}", flush=True)
                self.model = whisper.load_model(str(local_model_file))
            else:
                # Load model (will download if not cached)
                safe_print(f"[INFO] Loading model '{self.model_name}' (may download if not cached)...", flush=True)
                self.model = whisper.load_model(self.model_name)

            self.model_loaded = True
            device = "cpu"
            if TORCH_AVAILABLE and torch is not None and torch.cuda.is_available():
                device = f"cuda ({torch.cuda.get_device_name(0)})"
            safe_print(
                f"[OK] Whisper model '{self.model_name}' loaded successfully on {device}",
                flush=True,
            )
        except Exception as e:
            safe_print(f"[ERROR] Error loading Whisper model: {e}", flush=True)
            raise

    def _build_whisper_kwargs(self, language: Optional[str]) -> dict:
        """Tuned for loopback chunks: game chat, music/vocals, and video dialogue."""
        use_fp16 = bool(
            TORCH_AVAILABLE and torch is not None and torch.cuda.is_available()
        )
        kwargs: dict = {
            "task": "transcribe",
            "fp16": use_fp16,
            "condition_on_previous_text": False,
            "no_speech_threshold": 0.35,
            "compression_ratio_threshold": 2.6,
            "logprob_threshold": -1.2,
            "temperature": 0.0,
        }
        if language:
            kwargs["language"] = language
        prompt_by_lang = {
            "en": "English gaming callouts and voice chat.",
            "es": "Spanish gaming callouts: rush B, plantan, rotar, último en sitio.",
            "ru": "Russian gaming voice chat callouts.",
            "de": "German gaming voice chat callouts.",
            "fr": "French gaming voice chat callouts.",
        }
        if language and language in prompt_by_lang:
            kwargs["initial_prompt"] = prompt_by_lang[language]
        elif language is None:
            kwargs["initial_prompt"] = (
                "Multilingual gaming callouts in Spanish, English, Russian, or Portuguese."
            )
        return kwargs

    @staticmethod
    def _is_repetitive_hallucination(text: str) -> bool:
        """Game SFX/music often makes Whisper repeat one token many times."""
        trimmed = text.strip()
        if len(trimmed) > 100:
            return True

        import re

        phrases = [
            re.sub(r"[¡¿]", "", p).strip().lower()
            for p in re.split(r"[!?.…]+", trimmed)
            if p.strip()
        ]
        if len(phrases) >= 4:
            first = phrases[0]
            same = sum(1 for p in phrases if p == first)
            if same >= 4 and same / len(phrases) >= 0.75:
                return True

        words = [
            w
            for w in re.sub(r"[¡¿!?.…,]", " ", trimmed.lower()).split()
            if w
        ]
        if len(words) >= 6:
            counts: dict[str, int] = {}
            for w in words:
                counts[w] = counts.get(w, 0) + 1
            max_count = max(counts.values())
            if max_count >= 5 and max_count / len(words) >= 0.6:
                return True

        noise_phrases = ("ese es un juego", "game of life", "es sonido", "es son", "cítio", "citio")
        lower = trimmed.lower()
        if any(p in lower for p in noise_phrases):
            return True

        return False

    def _filter_transcription_text(
        self, text: str, detected_language: str, segments: list, rms_level: float
    ) -> Optional[dict]:
        """Return filtered empty result dict, or None to keep the transcription."""
        text_lower = text.lower().strip()
        text_clean = text_lower.rstrip(".,!?;:")

        hallucination_phrases = [
            "thank you for watching",
            "thanks for watching",
            "see you next time",
            "see you in the next",
            "please subscribe",
            "don't forget to subscribe",
            "ご視聴ありがとう",
            "subtitles by",
            "amara.org",
        ]
        if any(phrase in text_clean for phrase in hallucination_phrases):
            return {
                "text": "",
                "language": detected_language,
                "segments": [],
                "confidence": 0.0,
                "rms_level": rms_level,
                "filtered": True,
            }

        if self._is_repetitive_hallucination(text):
            print(
                f"[DEBUG] Filtered repetitive hallucination: {text[:60]!r}",
                flush=True,
            )
            return {
                "text": "",
                "language": detected_language,
                "segments": [],
                "confidence": 0.0,
                "rms_level": rms_level,
                "filtered": True,
            }

        if segments:
            logprobs = [s.get("avg_logprob", -99.0) for s in segments if "avg_logprob" in s]
            if logprobs:
                avg_logprob = sum(logprobs) / len(logprobs)
                logprob_floor = -2.0 if rms_level >= 0.08 else -1.25
                if avg_logprob < logprob_floor:
                    print(
                        f"[DEBUG] Filtered low-confidence transcription "
                        f"(avg_logprob={avg_logprob:.3f}): {text[:60]!r}",
                        flush=True,
                    )
                    return {
                        "text": "",
                        "language": detected_language,
                        "segments": [],
                        "confidence": 0.0,
                        "rms_level": rms_level,
                        "filtered": True,
                    }

        return None

    def _is_suspicious_transcription(self, text: str) -> bool:
        if not text:
            return True
        return bool(
            re.match(
                r"^(english|spanish|russian|german|french|portuguese)\.?$",
                text.strip(),
                re.I,
            )
        )

    def _run_whisper_pass(
        self, audio_data: np.ndarray, language: Optional[str]
    ) -> dict:
        whisper_kwargs = self._build_whisper_kwargs(language)
        if language:
            whisper_kwargs["language"] = language
        return self.model.transcribe(audio_data, **whisper_kwargs)

    def _transcribe_with_retries(
        self,
        audio_data: np.ndarray,
        language: Optional[str],
        duration_s: float,
    ) -> tuple[str, str, list]:
        """Try auto/en/es until we get usable text (loopback clips vary)."""
        tried: list[Optional[str]] = []
        order: list[Optional[str]] = []
        if language not in order:
            order.append(language)
        for candidate in (None, "en", "es"):
            if candidate not in order:
                order.append(candidate)

        best_text = ""
        best_lang = "unknown"
        best_segments: list = []
        best_score = -999.0

        for lang in order:
            if lang in tried:
                continue
            tried.append(lang)
            label = lang or "auto"
            try:
                result = self._run_whisper_pass(audio_data, lang)
            except Exception as exc:
                print(f"[WARN] Whisper pass ({label}) failed: {exc}", flush=True)
                continue

            text = (result.get("text") or "").strip()
            detected = result.get("language", lang or "unknown")
            segments = result.get("segments", [])
            print(f"[DEBUG] Whisper pass ({label}): {text[:80]!r}", flush=True)

            if self._is_suspicious_transcription(text):
                continue

            score = 0.0
            if segments:
                logprobs = [
                    s.get("avg_logprob", -99.0) for s in segments if "avg_logprob" in s
                ]
                if logprobs:
                    score = sum(logprobs) / len(logprobs)
            score += min(len(text), 40) * 0.05

            if text and score > best_score:
                best_score = score
                best_text = text
                best_lang = detected
                best_segments = segments

            if text and not self._is_suspicious_transcription(text) and score >= -1.0:
                return text, detected, segments

        if best_text:
            return best_text, best_lang, best_segments
        return "", language or "unknown", []

    def transcribe(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000,
        language: Optional[str] = None,
        min_audio_threshold: float = 0.01,
        channels: int = 1,
    ) -> Dict[str, Any]:
        """
        Transcribe audio data

        Args:
            audio_data: Audio data as numpy array (float32)
            sample_rate: Sample rate of audio
            language: Language code (None for auto-detect)
            min_audio_threshold: Minimum RMS level for valid speech

        Returns:
            Dict with 'text', 'language', 'segments', 'confidence'
        """
        # Ensure model is loaded
        if not self.model_loaded or self.model is None:
            self.load_model()

        # Validate audio data before processing
        if len(audio_data) == 0:
            raise ValueError("Audio data is empty")

        if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
            raise ValueError("Audio data contains NaN or Inf values")

        # Ensure audio_data is a proper numpy array
        if not isinstance(audio_data, np.ndarray):
            audio_data = np.array(audio_data, dtype=np.float32)

        # Ensure it's float32 and contiguous
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        if not audio_data.flags['C_CONTIGUOUS']:
            audio_data = np.ascontiguousarray(audio_data)

        # Log audio stats before processing
        initial_rms = np.sqrt(np.mean(audio_data**2)) if len(audio_data) > 0 else 0
        initial_max = np.max(np.abs(audio_data)) if len(audio_data) > 0 else 0
        print(f"[DEBUG] Initial audio stats: samples={len(audio_data)}, sample_rate={sample_rate}Hz, RMS={initial_rms:.6f}, max={initial_max:.6f}")

        # Our capture pipeline already sends mono float32. Only reshape when caller
        # explicitly marks interleaved stereo (channels >= 2).
        original_length = len(audio_data)
        if channels >= 2 and original_length % 2 == 0 and original_length >= 4:
            try:
                stereo_reshaped = audio_data.reshape(-1, 2)
                audio_data = np.mean(stereo_reshaped, axis=1).astype(np.float32)
                print(
                    f"[DEBUG] Converted interleaved stereo to mono: "
                    f"{original_length} -> {len(audio_data)} samples"
                )
            except (ValueError, Exception):
                pass

        # Ensure audio is still valid after conversion
        if len(audio_data) == 0:
            raise ValueError("Audio data is empty after stereo-to-mono conversion")

        if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
            raise ValueError("Audio data contains NaN or Inf values after stereo-to-mono conversion")

        # Resample if needed (Whisper expects 16kHz)
        if sample_rate != self.sample_rate:
            if sample_rate <= 0:
                raise ValueError(f"Invalid sample rate: {sample_rate}")
            if len(audio_data) < 2:
                raise ValueError(f"Audio data too short for resampling: {len(audio_data)} samples")

            # Calculate target number of samples
            num_samples = int(len(audio_data) * self.sample_rate / sample_rate)
            if num_samples <= 0:
                raise ValueError(f"Cannot resample: {len(audio_data)} samples at {sample_rate}Hz to {self.sample_rate}Hz")
            if num_samples < 2:
                raise ValueError(f"Resampled audio would be too short: {num_samples} samples")

            # Ensure audio_data is a proper numpy array
            if not isinstance(audio_data, np.ndarray):
                audio_data = np.array(audio_data, dtype=np.float32)

            # Ensure it's float32 and contiguous
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)
            if not audio_data.flags['C_CONTIGUOUS']:
                audio_data = np.ascontiguousarray(audio_data)

            # Validate before resampling
            if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
                raise ValueError("Audio data contains NaN or Inf values before resampling")

            try:
                # Try to avoid resampling if sample rates are very close
                ratio = self.sample_rate / sample_rate
                if abs(ratio - 1.0) < 0.01:
                    # Sample rates are very close, just use the audio as-is
                    print(f"[DEBUG] Skipping resampling: sample rates are very close ({sample_rate}Hz vs {self.sample_rate}Hz)")
                else:
                    # Use resample_poly for better stability with large arrays
                    from scipy.signal import resample_poly
                    gcd = np.gcd(int(sample_rate), int(self.sample_rate))
                    up = int(self.sample_rate // gcd)
                    down = int(sample_rate // gcd)

                    print(f"[DEBUG] Resampling: {len(audio_data)} samples at {sample_rate}Hz -> {num_samples} samples at {self.sample_rate}Hz (ratio {up}:{down})")

                    if up == 1 and down == 1:
                        # No resampling needed
                        pass
                    elif len(audio_data) > 0 and num_samples > 0:
                        # Ensure audio is contiguous before resampling
                        if not audio_data.flags['C_CONTIGUOUS']:
                            audio_data = np.ascontiguousarray(audio_data, dtype=np.float32)

                        # Use resample_poly which is more stable than resample
                        try:
                            # Ensure audio is valid before resampling
                            if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
                                raise ValueError("Audio contains NaN/Inf before resample_poly")

                            # Check that up and down are valid
                            if up <= 0 or down <= 0:
                                raise ValueError(f"Invalid resampling ratio: up={up}, down={down}")

                            audio_data = resample_poly(audio_data, up, down)

                            # Validate result
                            if len(audio_data) == 0:
                                raise ValueError("resample_poly produced empty result")
                            if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
                                raise ValueError("resample_poly produced NaN/Inf values")

                        except (OSError, ValueError) as resample_error:
                            # If resample_poly fails, try simple decimation/interpolation
                            error_msg = str(resample_error)
                            errno_info = f" (errno {resample_error.errno})" if hasattr(resample_error, 'errno') else ""
                            print(f"[WARN] resample_poly failed: {error_msg}{errno_info}, trying alternative method")

                            resample_ratio = self.sample_rate / sample_rate
                            if resample_ratio < 1.0:
                                # Downsampling - use decimation
                                step = int(1 / resample_ratio)
                                if step > 0 and step < len(audio_data):
                                    audio_data = audio_data[::step]
                                    print(f"[DEBUG] Used decimation: step={step}, result length={len(audio_data)}")
                                else:
                                    raise ValueError(f"Cannot downsample: invalid step {step} for {len(audio_data)} samples")
                            else:
                                # Upsampling - use linear interpolation
                                from scipy.interpolate import interp1d
                                x_old = np.linspace(0, 1, len(audio_data))
                                x_new = np.linspace(0, 1, num_samples)
                                f = interp1d(x_old, audio_data, kind='linear', bounds_error=False, fill_value=0)
                                audio_data = f(x_new).astype(np.float32)
                                print(f"[DEBUG] Used interpolation: {len(audio_data)} -> {num_samples} samples")

                        # Ensure we have the right number of samples
                        if len(audio_data) != num_samples:
                            # Trim or pad if needed
                            if len(audio_data) > num_samples:
                                audio_data = audio_data[:num_samples]
                            else:
                                padding = np.zeros(num_samples - len(audio_data), dtype=np.float32)
                                audio_data = np.concatenate([audio_data, padding])

                # Validate after resampling
                if np.any(np.isnan(audio_data)) or np.any(np.isinf(audio_data)):
                    raise ValueError("Resampling produced NaN or Inf values")
            except ValueError as e:
                raise ValueError(f"Resampling failed: {e}. Input: {len(audio_data)} samples at {sample_rate}Hz, target: {num_samples} samples at {self.sample_rate}Hz")
            except OSError as e:
                # Catch system-level errors like [Errno 22]
                import traceback
                raise ValueError(f"Resampling system error: {e} (errno {e.errno if hasattr(e, 'errno') else 'unknown'}). Input: {len(audio_data)} samples at {sample_rate}Hz, target: {num_samples} samples at {self.sample_rate}Hz. Traceback: {traceback.format_exc()}")
            except Exception as e:
                import traceback
                raise ValueError(f"Resampling error: {e}. Input: {len(audio_data)} samples at {sample_rate}Hz, target: {num_samples} samples at {self.sample_rate}Hz. Traceback: {traceback.format_exc()}")

        # Ensure float32 (Whisper requirement)
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)

        # Check audio level
        rms_level = np.sqrt(np.mean(audio_data**2)) if len(audio_data) > 0 else 0
        max_level = np.max(np.abs(audio_data)) if len(audio_data) > 0 else 0

        # Log audio levels for debugging
        print(f"[DEBUG] Audio level check: RMS={rms_level:.6f}, max={max_level:.6f}, threshold={min_audio_threshold:.6f}, samples={len(audio_data)}")

        # Very lenient threshold - let Whisper decide if there's speech
        # Only filter out completely silent audio (RMS < 0.0001)
        # Whisper is very good at detecting speech even in quiet audio
        effective_threshold = 0.0001  # Very low - only filter complete silence
        peak_threshold = 0.0005  # Very low peak threshold

        # Only skip if audio is essentially silent (both RMS and peak are extremely low)
        if rms_level < effective_threshold and max_level < peak_threshold:
            print(f"[DEBUG] Audio essentially silent: RMS={rms_level:.6f} < {effective_threshold:.6f} and max={max_level:.6f} < {peak_threshold:.6f}")
            return {
                "text": "",
                "language": "unknown",
                "segments": [],
                "confidence": 0.0,
                "rms_level": rms_level
            }

        print(f"[DEBUG] Audio level passed: RMS={rms_level:.6f}, max={max_level:.6f}, proceeding with transcription")

        # Check maximum length (Whisper has limits, typically 30 seconds at 16kHz = 480000 samples)
        # For safety, limit to 30 seconds
        max_samples = int(self.sample_rate * 30)  # 30 seconds max
        if len(audio_data) > max_samples:
            print(f"[WARN] Audio too long ({len(audio_data)} samples, {len(audio_data)/self.sample_rate:.2f}s), truncating to {max_samples} samples")
            audio_data = audio_data[:max_samples]

        # Transcribe
        try:
            # Log audio data info before transcription
            print(f"[DEBUG] Before transcription: len={len(audio_data)}, dtype={audio_data.dtype}, "
                  f"min={np.min(audio_data):.6f}, max={np.max(audio_data):.6f}, "
                  f"mean={np.mean(audio_data):.6f}, has_nan={np.any(np.isnan(audio_data))}, "
                  f"has_inf={np.any(np.isinf(audio_data))}, shape={audio_data.shape}")

            # Ensure audio is in the right format for Whisper
            if not audio_data.flags['C_CONTIGUOUS']:
                audio_data = np.ascontiguousarray(audio_data, dtype=np.float32)

            # Ensure it's 1D array
            if audio_data.ndim > 1:
                audio_data = audio_data.flatten()

            # Clamp values to valid range for audio ([-1, 1])
            audio_data = np.clip(audio_data, -1.0, 1.0)

            # Final validation
            if len(audio_data) == 0:
                raise ValueError("Audio data is empty after processing")

            # Short ranked callouts can be ~0.35s after trim; allow down to 0.32s at 16 kHz.
            min_samples = int(self.sample_rate * 0.32)
            if len(audio_data) < min_samples:
                raise ValueError(f"Audio data too short: {len(audio_data)} samples ({len(audio_data)/self.sample_rate:.3f}s, need at least {min_samples} samples / {min_samples/self.sample_rate:.1f}s)")

            # Ensure it's exactly float32 and contiguous
            audio_data = np.ascontiguousarray(audio_data.astype(np.float32), dtype=np.float32)

            print(f"[DEBUG] Calling Whisper transcribe with {len(audio_data)} samples")
            duration_s = len(audio_data) / self.sample_rate
            text, detected_language, segments = self._transcribe_with_retries(
                audio_data, language, duration_s
            )

            filtered = self._filter_transcription_text(
                text, detected_language, segments, rms_level
            )
            if filtered is not None:
                return filtered

            return {
                "text": text,
                "language": detected_language,
                "segments": segments,
                "confidence": 1.0,  # Whisper doesn't provide confidence scores
                "rms_level": rms_level
            }
        except Exception as e:
            safe_print(f"[ERROR] Error transcribing audio: {e}", flush=True)
            raise
