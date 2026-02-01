"""
Whisper speech recognition service
Refactored from src/core/speech/recognizer.py
"""
import sys
import os
import time
import whisper
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
            # Default to project root models directory
            project_root = Path(__file__).parent.parent.parent
            self.models_dir = project_root / "models" / "whisper"
        
        self.models_dir.mkdir(parents=True, exist_ok=True)
    
    def load_model(self):
        """Load Whisper model (lazy loading)"""
        if self.model_loaded and self.model is not None:
            return
        
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
            safe_print(f"[OK] Whisper model '{self.model_name}' loaded successfully", flush=True)
        except Exception as e:
            safe_print(f"[ERROR] Error loading Whisper model: {e}", flush=True)
            raise
    
    def transcribe(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000,
        language: Optional[str] = None,
        min_audio_threshold: float = 0.01
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
        
        # Convert stereo to mono if needed
        # Whisper expects mono audio. If we have stereo (interleaved L, R, L, R...),
        # we need to convert it to mono by averaging channels.
        # VB-Audio Virtual Cable typically outputs stereo at 48kHz, so we detect and convert.
        # We only attempt conversion if:
        # 1. Sample rate is 48kHz (common for VB-Audio and other virtual cables)
        # 2. Length is even (required for interleaved stereo)
        # 3. We have enough samples to make it worthwhile
        original_length = len(audio_data)
        
        # Note: Audio from Rust backend is already converted to mono
        # Only attempt stereo-to-mono if we detect it's likely stereo AND the duration would be reasonable after conversion
        # Check: if converting as stereo would result in < 0.3s, it's probably already mono
        if sample_rate == 48000 and original_length % 2 == 0 and original_length >= 4:
            # Calculate what duration would be after stereo conversion
            potential_mono_length = original_length // 2
            potential_duration = potential_mono_length / sample_rate
            # Only convert if the resulting duration would be reasonable (>= 0.3s)
            # This prevents incorrectly converting already-mono audio
            if potential_duration >= 0.3:
                try:
                    stereo_reshaped = audio_data.reshape(-1, 2)
                    audio_data = np.mean(stereo_reshaped, axis=1).astype(np.float32)
                    print(f"[DEBUG] Converted stereo to mono: {original_length} samples -> {len(audio_data)} samples (48kHz stereo -> mono, duration={potential_duration:.2f}s)")
                except (ValueError, Exception) as e:
                    # If reshaping fails, it's likely already mono, continue as-is
                    pass
            else:
                # Duration would be too short after conversion, so it's likely already mono
                print(f"[DEBUG] Skipping stereo conversion: duration would be {potential_duration:.2f}s (too short, likely already mono)")
        elif sample_rate != 48000 and sample_rate >= 16000 and original_length % 2 == 0 and original_length >= 4:
            potential_mono_length = original_length // 2
            potential_duration = potential_mono_length / sample_rate
            if potential_duration >= 0.3:
                try:
                    stereo_reshaped = audio_data.reshape(-1, 2)
                    audio_data = np.mean(stereo_reshaped, axis=1).astype(np.float32)
                    print(f"[DEBUG] Converted stereo to mono: {original_length} samples -> {len(audio_data)} samples ({sample_rate}Hz stereo -> mono)")
                except (ValueError, Exception) as e:
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
            
            # Check minimum length (Whisper needs at least 0.5 seconds of audio for reliable transcription)
            min_samples = int(self.sample_rate * 0.5)  # At least 0.5 seconds
            if len(audio_data) < min_samples:
                raise ValueError(f"Audio data too short: {len(audio_data)} samples ({len(audio_data)/self.sample_rate:.3f}s, need at least {min_samples} samples / {min_samples/self.sample_rate:.1f}s)")
            
            # Ensure it's exactly float32 and contiguous
            audio_data = np.ascontiguousarray(audio_data.astype(np.float32), dtype=np.float32)
            
            print(f"[DEBUG] Calling Whisper transcribe with {len(audio_data)} samples")
            
            # Try direct transcription first (simpler, may work)
            # If that fails, fall back to file-based transcription
            tmp_path = None
            try:
                # Try direct transcription first
                print(f"[DEBUG] Attempting direct transcription with {len(audio_data)} samples")
                result = self.model.transcribe(
                    audio_data,
                    language=language,
                    task="transcribe",
                    fp16=False  # Use float32 for compatibility
                )
                print(f"[DEBUG] Direct transcription succeeded")
            except (OSError, ValueError, RuntimeError) as direct_error:
                # Direct transcription failed, try file-based approach
                error_str = str(direct_error)
                errno_info = f" (errno {direct_error.errno})" if hasattr(direct_error, 'errno') else ""
                
                print(f"[WARN] Direct transcription failed: {error_str}{errno_info}, trying file-based approach")
                print(f"[DEBUG] Audio stats: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}")
                
                if not SOUNDFILE_AVAILABLE:
                    # If soundfile is not available, we can't use file-based fallback
                    import traceback
                    error_msg = f"Whisper transcription failed: {error_str}{errno_info}"
                    error_msg += f"\nAudio: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}"
                    error_msg += f"\nNote: soundfile not available, cannot use file-based fallback"
                    error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                    print(f"[ERROR] {error_msg}")
                    raise ValueError(error_msg)
                
                # Try file-based transcription
                try:
                    import os
                    import tempfile
                    
                    # Create temp file using mkstemp for better control
                    fd, tmp_path = tempfile.mkstemp(suffix='.wav', prefix='whisper_')
                    os.close(fd)  # Close the file descriptor, we'll use soundfile to write
                    
                    print(f"[DEBUG] Created temp file: {tmp_path}")
                    
                    # Ensure audio is in valid range and format
                    audio_for_file = np.clip(audio_data, -1.0, 1.0).astype(np.float32)
                    
                    # Validate audio before writing
                    if np.any(np.isnan(audio_for_file)) or np.any(np.isinf(audio_for_file)):
                        raise ValueError("Audio contains NaN/Inf values, cannot write to file")
                    
                    if len(audio_for_file) == 0:
                        raise ValueError("Audio is empty, cannot write to file")
                    
                    # Save audio to WAV file with error handling
                    try:
                        print(f"[DEBUG] Writing {len(audio_for_file)} samples to {tmp_path} at {self.sample_rate}Hz")
                        # Convert to int16 for WAV format (standard PCM)
                        # Audio is already in [-1, 1] range, so scale to int16 range
                        audio_int16 = (audio_for_file * 32767.0).astype(np.int16)
                        sf.write(tmp_path, audio_int16, self.sample_rate, subtype='PCM_16')
                        print(f"[DEBUG] Successfully saved audio to temp file")
                    except Exception as write_error:
                        import traceback
                        error_msg = f"Failed to write audio file: {write_error}"
                        error_msg += f"\nAudio: {len(audio_for_file)} samples, dtype={audio_for_file.dtype}, shape={audio_for_file.shape}"
                        error_msg += f"\nSample rate: {self.sample_rate}"
                        error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                        print(f"[ERROR] {error_msg}")
                        # Clean up temp file
                        if tmp_path:
                            try:
                                os.unlink(tmp_path)
                            except:
                                pass
                        raise ValueError(error_msg)
                    
                    # Verify file was created and has content
                    if not os.path.exists(tmp_path):
                        raise ValueError(f"Temp file was not created: {tmp_path}")
                    
                    file_size = os.path.getsize(tmp_path)
                    if file_size == 0:
                        raise ValueError(f"Temp file is empty: {tmp_path}")
                    
                    print(f"[DEBUG] Temp file size: {file_size} bytes")
                    
                    # Transcribe from file
                    try:
                        result = self.model.transcribe(
                            tmp_path,
                            language=language,
                            task="transcribe",
                            fp16=False
                        )
                        print(f"[DEBUG] File-based transcription succeeded")
                    except Exception as transcribe_error:
                        import traceback
                        error_msg = f"File-based transcription failed: {transcribe_error}"
                        error_msg += f"\nFile: {tmp_path}, size: {file_size} bytes"
                        error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                        print(f"[ERROR] {error_msg}")
                        raise ValueError(error_msg)
                    finally:
                        # Clean up temp file
                        if tmp_path:
                            try:
                                os.unlink(tmp_path)
                                tmp_path = None
                            except Exception as cleanup_error:
                                print(f"[WARN] Failed to delete temp file {tmp_path}: {cleanup_error}")
                except Exception as file_error:
                    # Clean up temp file on error
                    import os
                    if tmp_path:
                        try:
                            os.unlink(tmp_path)
                        except:
                            pass
                    
                    # If file-based also fails, raise with detailed info
                    import traceback
                    error_msg = f"Whisper transcription failed (both direct and file-based): {error_str}{errno_info}"
                    error_msg += f"\nFile-based error: {file_error}"
                    error_msg += f"\nAudio: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}"
                    error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                    print(f"[ERROR] {error_msg}")
                    raise ValueError(error_msg)
            except (OSError, ValueError, RuntimeError) as e:
                # If file-based transcription fails, try direct transcription as fallback
                import traceback
                import os
                
                error_str = str(e)
                errno_info = f" (errno {e.errno})" if hasattr(e, 'errno') else ""
                
                print(f"[WARN] File-based transcription failed: {e}{errno_info}, trying direct transcription")
                print(f"[DEBUG] Audio stats: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}")
                
                # Clean up temp file if it exists
                if tmp_path:
                    try:
                        os.unlink(tmp_path)
                    except:
                        pass
                
                try:
                    # Try direct transcription as fallback
                    result = self.model.transcribe(
                        audio_data,
                        language=language,
                        task="transcribe",
                        fp16=False
                    )
                    print(f"[DEBUG] Direct transcription succeeded (fallback)")
                except Exception as direct_error:
                    # Both methods failed
                    error_msg = f"Whisper transcription failed (both file-based and direct): {e}{errno_info}"
                    error_msg += f"\nDirect transcription error: {direct_error}"
                    error_msg += f"\nAudio: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}"
                    error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                    print(f"[ERROR] {error_msg}")
                    raise ValueError(error_msg)
            except Exception as e:
                # Catch any other errors from Whisper
                import traceback
                error_msg = f"Whisper transcription error: {e}"
                error_msg += f"\nAudio: {len(audio_data)} samples, dtype={audio_data.dtype}, shape={audio_data.shape}"
                error_msg += f"\nTraceback:\n{traceback.format_exc()}"
                print(f"[ERROR] {error_msg}")
                raise ValueError(error_msg)
            
            text = result["text"].strip()
            detected_language = result.get("language", "unknown")
            segments = result.get("segments", [])
            
            # Filter false positives
            text_lower = text.lower().strip()
            text_clean = text_lower.rstrip('.,!?;:')
            
            high_confidence_false_positives = [
                "thank you", "thanks", "thank you.",
                "hello", "hi", "hey"
            ]
            
            if any(fp in text_clean for fp in high_confidence_false_positives):
                return {
                    "text": "",
                    "language": detected_language,
                    "segments": [],
                    "confidence": 0.0,
                    "rms_level": rms_level,
                    "filtered": True
                }
            
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
