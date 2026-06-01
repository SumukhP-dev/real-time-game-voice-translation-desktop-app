"""
Playback routing for TTS output (virtual cable / speakers).
"""
from __future__ import annotations

import threading
from typing import List, Optional

import numpy as np

try:
    import sounddevice as sd

    _SOUNDDEVICE_AVAILABLE = True
except ImportError:
    sd = None  # type: ignore
    _SOUNDDEVICE_AVAILABLE = False


def playback_available() -> bool:
    return _SOUNDDEVICE_AVAILABLE and sd is not None


def list_playback_devices() -> List[dict]:
    """PortAudio output devices for TTS routing (e.g. VB-Audio CABLE Input)."""
    if not playback_available():
        return []
    devices: List[dict] = []
    try:
        for index, dev in enumerate(sd.query_devices()):
            if int(dev.get("max_output_channels", 0)) > 0:
                devices.append(
                    {
                        "index": index,
                        "name": str(dev.get("name", f"Device {index}")),
                        "channels": int(dev["max_output_channels"]),
                        "sample_rate": int(dev.get("default_samplerate", 48000)),
                        "is_default": index == sd.default.device[1],
                    }
                )
    except Exception as e:
        print(f"[AUDIO] Failed to list playback devices: {e}", flush=True)
    return devices


class AudioOutputPlayer:
    """Thread-safe queued playback to a chosen output device."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._playing = False

    @property
    def is_playing(self) -> bool:
        with self._lock:
            return self._playing

    def play(
        self,
        samples: np.ndarray,
        sample_rate: int,
        device_index: Optional[int] = None,
        volume: float = 1.0,
    ) -> None:
        if not playback_available() or sd is None:
            raise RuntimeError("sounddevice not available for audio playback")

        mono = np.asarray(samples, dtype=np.float32).reshape(-1)
        if mono.size == 0:
            return

        vol = max(0.0, min(1.0, float(volume)))
        mono = np.clip(mono * vol, -1.0, 1.0)

        with self._lock:
            self._playing = True

        try:
            sd.play(mono, samplerate=int(sample_rate), device=device_index, blocking=True)
        finally:
            with self._lock:
                self._playing = False
