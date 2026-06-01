"""
Text-to-speech synthesis for outbound voice translation.

Uses pyttsx3 (Windows SAPI) when available, gTTS + pydub as fallback for
non-English or when pyttsx3 fails.
"""
from __future__ import annotations

import io
import os
import sys
import tempfile
import threading
from typing import Optional, Tuple

import numpy as np

try:
    import soundfile as sf

    _SOUNDFILE_AVAILABLE = True
except ImportError:
    sf = None  # type: ignore
    _SOUNDFILE_AVAILABLE = False

try:
    import pyttsx3

    _PYTTSX3_AVAILABLE = True
except ImportError:
    pyttsx3 = None  # type: ignore
    _PYTTSX3_AVAILABLE = False

try:
    from gtts import gTTS
    from pydub import AudioSegment

    _GTTS_AVAILABLE = True
except ImportError:
    gTTS = None  # type: ignore
    AudioSegment = None  # type: ignore
    _GTTS_AVAILABLE = False

_engine_lock = threading.Lock()

# ISO 639-1 codes supported by gTTS (subset used by the app)
_GTTS_LANG_MAP = {
    "en": "en",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ru": "ru",
    "zh": "zh-CN",
    "ja": "ja",
    "ko": "ko",
    "pt": "pt",
    "it": "it",
    "ar": "ar",
    "hi": "hi",
    "tr": "tr",
    "pl": "pl",
    "uk": "uk",
}


def _normalize_language(language: str) -> str:
    code = (language or "en").strip().lower()
    if code in ("auto", "unknown"):
        return "en"
    return code.split("-")[0]


def _resample_linear(samples: np.ndarray, src_rate: int, dst_rate: int) -> np.ndarray:
    if src_rate == dst_rate or samples.size == 0:
        return samples.astype(np.float32, copy=False)
    duration = samples.shape[0] / float(src_rate)
    out_len = max(1, int(round(duration * dst_rate)))
    x_old = np.linspace(0.0, 1.0, num=samples.shape[0], endpoint=False)
    x_new = np.linspace(0.0, 1.0, num=out_len, endpoint=False)
    return np.interp(x_new, x_old, samples).astype(np.float32)


def _load_wav_mono_float32(path: str) -> Tuple[np.ndarray, int]:
    if not _SOUNDFILE_AVAILABLE or sf is None:
        raise RuntimeError("soundfile is required for TTS playback")
    data, sample_rate = sf.read(path, dtype="float32", always_2d=False)
    arr = np.asarray(data, dtype=np.float32)
    if arr.ndim == 2:
        arr = np.mean(arr, axis=1)
    return arr.reshape(-1).astype(np.float32, copy=False), int(sample_rate)


def _synthesize_pyttsx3(text: str, rate: float, volume: float) -> Tuple[np.ndarray, int]:
    if not _PYTTSX3_AVAILABLE or pyttsx3 is None:
        raise RuntimeError("pyttsx3 not installed")

    driver = "sapi5" if sys.platform == "win32" else None
    with _engine_lock:
        engine = pyttsx3.init(driver) if driver else pyttsx3.init()
        try:
            engine.setProperty("volume", max(0.0, min(1.0, volume)))
            base_rate = engine.getProperty("rate") or 200
            engine.setProperty("rate", int(max(80, min(300, base_rate * rate))))
            fd, path = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            try:
                engine.save_to_file(text, path)
                engine.runAndWait()
                if not os.path.isfile(path) or os.path.getsize(path) < 44:
                    raise RuntimeError("pyttsx3 produced empty audio")
                return _load_wav_mono_float32(path)
            finally:
                try:
                    os.remove(path)
                except OSError:
                    pass
        finally:
            try:
                engine.stop()
            except Exception:
                pass


def _synthesize_gtts(text: str, language: str) -> Tuple[np.ndarray, int]:
    if not _GTTS_AVAILABLE or gTTS is None or AudioSegment is None:
        raise RuntimeError("gTTS/pydub not installed")

    lang = _GTTS_LANG_MAP.get(_normalize_language(language), "en")
    mp3_buf = io.BytesIO()
    gTTS(text=text, lang=lang).write_to_fp(mp3_buf)
    mp3_buf.seek(0)
    segment = AudioSegment.from_file(mp3_buf, format="mp3")
    segment = segment.set_channels(1)
    samples = np.array(segment.get_array_of_samples(), dtype=np.float32)
    if segment.sample_width > 0:
        samples /= float(2 ** (8 * segment.sample_width - 1))
    return samples, int(segment.frame_rate)


class TTSService:
    """Synthesize speech as mono float32 PCM."""

    def synthesize(
        self,
        text: str,
        language: str = "en",
        rate: float = 1.0,
        volume: float = 1.0,
        target_sample_rate: Optional[int] = None,
    ) -> Tuple[np.ndarray, int]:
        cleaned = (text or "").strip()
        if not cleaned:
            raise ValueError("TTS text is empty")

        lang = _normalize_language(language)
        last_err: Optional[Exception] = None

        if _PYTTSX3_AVAILABLE and sys.platform == "win32":
            try:
                samples, sr = _synthesize_pyttsx3(cleaned, rate=rate, volume=volume)
                if target_sample_rate and target_sample_rate != sr:
                    samples = _resample_linear(samples, sr, target_sample_rate)
                    sr = target_sample_rate
                return samples, sr
            except Exception as e:
                last_err = e
                print(f"[TTS] pyttsx3 failed, trying gTTS: {e}", flush=True)

        if _GTTS_AVAILABLE:
            try:
                samples, sr = _synthesize_gtts(cleaned, lang)
                peak = float(np.max(np.abs(samples))) if samples.size else 0.0
                if peak > 0:
                    samples = np.clip(samples * volume / peak, -1.0, 1.0)
                if target_sample_rate and target_sample_rate != sr:
                    samples = _resample_linear(samples, sr, target_sample_rate)
                    sr = target_sample_rate
                return samples, sr
            except Exception as e:
                last_err = e

        raise RuntimeError(f"TTS synthesis failed: {last_err or 'no TTS engine available'}")
