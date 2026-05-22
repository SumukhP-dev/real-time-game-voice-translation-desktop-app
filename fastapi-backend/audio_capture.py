"""
Audio capture using OS-native loopback where available.

On Windows, `soundcard` opens WASAPI loopback on each speaker/output device (no VB-Cable
or Stereo Mix required) and lists physical microphones after those entries.

On macOS, `soundcard` exposes loopback/monitor devices for each output (Core Audio).

If `soundcard` is not installed, falls back to PortAudio (`sounddevice`) input devices only.
"""
from __future__ import annotations

import queue
import sys
import threading
import time
from contextlib import contextmanager
from typing import Any, Iterator, List, Optional, Tuple

import numpy as np

# WASAPI/COM: apartment-threaded mode is more stable for some headphone / loopback endpoints.
_COINIT_APARTMENTTHREADED = 2


@contextmanager
def _soundcard_com_context() -> Iterator[None]:
    """Initialize COM on Windows before soundcard WASAPI calls."""
    if sys.platform != "win32":
        yield
        return
    from ctypes import windll

    windll.ole32.CoInitializeEx(None, _COINIT_APARTMENTTHREADED)
    try:
        yield
    finally:
        windll.ole32.CoUninitialize()

try:
    import sounddevice as sd

    _SOUNDDEVICE_AVAILABLE = True
except ImportError:
    sd = None  # type: ignore
    _SOUNDDEVICE_AVAILABLE = False

try:
    import soundcard as sc

    _SOUNDCARD_AVAILABLE = True
except ImportError:
    sc = None  # type: ignore
    _SOUNDCARD_AVAILABLE = False

def soundcard_capture_available() -> bool:
    return _SOUNDCARD_AVAILABLE and sc is not None


# Hard cap per WebSocket payload: oversized buffers can crash the Electron renderer
# (JSON parse + JS Math on huge arrays). Some drivers occasionally return huge blocks.
MAX_SAMPLES_PER_WS_CHUNK = 8192


def _soundcard_microphone_list():
    if not soundcard_capture_available():
        return []
    try:
        return sc.all_microphones(include_loopback=True)
    except Exception as e:
        print(f"[AUDIO] soundcard list failed: {e}", flush=True)
        return []


def soundcard_device_count() -> int:
    return len(_soundcard_microphone_list())


def soundcard_preferred_samplerate(device_index: int, default_rate: int = 48000) -> int:
    """Return a sane per-device sample rate for soundcard capture."""
    mics = _soundcard_microphone_list()
    if not (0 <= device_index < len(mics)):
        return int(default_rate)

    mic = mics[device_index]
    raw_rate = getattr(mic, "samplerate", None)
    if raw_rate is None:
        return int(default_rate)

    try:
        rate = int(float(raw_rate))
    except (TypeError, ValueError):
        return int(default_rate)

    # Guard against clearly invalid values.
    if rate < 8000 or rate > 384000:
        return int(default_rate)
    return rate


def _open_soundcard_recorder(mic: Any, samplerate: int, block_size: int):
    """Try several recorder() signatures; some devices only work with defaults."""
    block_size = max(128, int(block_size))
    attempts: Tuple[dict, ...] = (
        {"samplerate": int(samplerate), "blocksize": block_size},
        {"blocksize": block_size},
        {"samplerate": int(samplerate)},
        {},
    )
    last_err: Optional[Exception] = None
    for kwargs in attempts:
        try:
            return mic.recorder(**kwargs)
        except Exception as e:
            last_err = e
            continue
    raise RuntimeError(f"Could not open soundcard recorder: {last_err}")


def probe_soundcard_capture(
    device_index: int, samplerate: int, block_size: int
) -> int:
    """
    Open the device, read one small block, close. Returns effective sample rate.
    Raises on failure so /audio/start can return HTTP error instead of a broken session.
    """
    if not soundcard_capture_available():
        raise RuntimeError("soundcard module not available")

    with _soundcard_com_context():
        mics = sc.all_microphones(include_loopback=True)
        if not (0 <= device_index < len(mics)):
            raise RuntimeError(f"Invalid device index {device_index}")

        mic = mics[device_index]
        block_size = max(128, min(int(block_size), 4096))
        rec_ctx = _open_soundcard_recorder(mic, samplerate, block_size)
        with rec_ctx as rec:
            effective = int(getattr(rec, "samplerate", samplerate))
            n = min(512, block_size)
            data = rec.record(numframes=n)
            if data is None:
                raise RuntimeError("soundcard probe returned no data")
            arr = np.asarray(data, dtype=np.float32)
            if arr.size == 0:
                raise RuntimeError("soundcard probe empty buffer")
        return effective


def _to_mono_float32(data: Any) -> np.ndarray:
    """Normalize soundcard frames to 1-D float32 mono."""
    arr = np.asarray(data, dtype=np.float32)
    if arr.size == 0:
        return arr.reshape(0)

    if arr.ndim >= 3:
        arr = np.reshape(arr, (arr.shape[0], -1))

    if arr.ndim == 2:
        return np.mean(arr, axis=1).astype(np.float32, copy=False)

    return arr.reshape(-1).astype(np.float32, copy=False)


def _sounddevice_input_devices() -> List[dict]:
    if not _SOUNDDEVICE_AVAILABLE or sd is None:
        return []
    out: List[dict] = []
    try:
        for i, dev in enumerate(sd.query_devices()):
            if dev["max_input_channels"] > 0:
                out.append(
                    {
                        "index": i,
                        "name": dev["name"],
                        "channels": int(dev["max_input_channels"]),
                        "sample_rate": int(dev["default_samplerate"]),
                        "is_input": True,
                    }
                )
    except Exception as e:
        print(f"[AUDIO] sounddevice list failed: {e}", flush=True)
    return out


def list_capture_devices() -> List[dict]:
    """Devices for /audio/devices: soundcard (loopback + mics) when available, else sounddevice inputs."""
    result: List[dict] = []
    mics = _soundcard_microphone_list()
    if mics:
        for i, mic in enumerate(mics):
            sample_rate = soundcard_preferred_samplerate(i, default_rate=48000)
            name = mic.name or ""
            name_lower = name.lower()
            is_loopback = bool(getattr(mic, "isloopback", False)) or "loopback" in name_lower
            result.append(
                {
                    "index": i,
                    "name": name,
                    "channels": int(mic.channels),
                    "sample_rate": sample_rate,
                    "is_input": True,
                    "is_loopback": is_loopback,
                }
            )
        return result

    for dev in _sounddevice_input_devices():
        result.append(dict(dev))
    return result


class SoundcardCaptureController:
    """
    Background capture via soundcard (WASAPI loopback on Windows).
    Pushes (samples_list, sample_rate) like the former sounddevice callback.
    """

    _is_soundcard_capture = True

    def __init__(self, device_index: int, chunk_queue: "threading.Queue", block_size: int, samplerate: int = 48000):
        self._device_index = device_index
        self._queue = chunk_queue
        self._block_size = max(256, int(block_size))
        self._samplerate = int(samplerate)
        self._stop = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=4.0)
        self._thread = None

    def _run(self) -> None:
        if not soundcard_capture_available():
            return
        try:
            with _soundcard_com_context():
                mics = sc.all_microphones(include_loopback=True)
                if not (0 <= self._device_index < len(mics)):
                    print(f"[AUDIO] Invalid soundcard index {self._device_index}", flush=True)
                    return
                mic = mics[self._device_index]
                recorder_ctx = _open_soundcard_recorder(mic, self._samplerate, self._block_size)

                with recorder_ctx as rec:
                    effective_rate = int(getattr(rec, "samplerate", self._samplerate))
                    drop_log_t = 0.0
                    while not self._stop.is_set():
                        try:
                            data = rec.record(numframes=self._block_size)
                        except Exception as e:
                            print(f"[AUDIO] soundcard record() error: {e}", flush=True)
                            time.sleep(0.02)
                            continue

                        if data is None:
                            time.sleep(0.001)
                            continue

                        mono = _to_mono_float32(data)
                        if mono.size == 0:
                            time.sleep(0.001)
                            continue

                        if mono.size > MAX_SAMPLES_PER_WS_CHUNK:
                            mono = mono[:MAX_SAMPLES_PER_WS_CHUNK]

                        peak = float(np.max(np.abs(mono))) if mono.size else 0.0
                        if 0.0 < peak < 0.02:
                            gain = min(8.0, 0.02 / max(peak, 1e-9))
                            mono = np.clip(mono * gain, -1.0, 1.0).astype(
                                np.float32, copy=False
                            )

                        try:
                            self._queue.put_nowait((mono.tolist(), effective_rate))
                        except queue.Full:
                            now = time.monotonic()
                            if now - drop_log_t > 2.0:
                                print(
                                    "[AUDIO] Chunk queue full; dropping audio (slow consumer)",
                                    flush=True,
                                )
                                drop_log_t = now
        except Exception as e:
            print(f"[AUDIO] soundcard capture thread error: {e}", flush=True)
            import traceback

            traceback.print_exc()


class SounddeviceInputController:
    """Wrapper for PortAudio InputStream (stop + close)."""

    def __init__(self, stream: Any):
        self._stream = stream

    def stop(self) -> None:
        if self._stream is not None:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception as e:
                print(f"[AUDIO] Stop stream error: {e}", flush=True)
            self._stream = None


# Backwards-compatible names for main.py imports
WasapiLoopbackController = SoundcardCaptureController
loopback_count = soundcard_device_count


def wasapi_loopback_supported() -> bool:
    """True when soundcard provides loopback (Windows WASAPI; also loopback/monitor on other OS)."""
    return soundcard_capture_available() and bool(_soundcard_microphone_list())


def resolve_loopback_imm_device(device_index: int) -> Optional[Any]:
    """Unused with soundcard path; kept for import compatibility."""
    return None
