"""
FastAPI service for ML models (Whisper and Translation)
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import io
import json
from whisper_service import WhisperService
from translation_service import TranslationService
from speaker_identification import get_service as get_speaker_service
from adaptive_learning import learn_preference, get_personalized_translation

app = FastAPI(title="CS:GO 2 Translation ML Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to Tauri app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (lazy loading)
whisper_service: Optional[WhisperService] = None
translation_service: Optional[TranslationService] = None

# Request/Response models
class TranscribeRequest(BaseModel):
    model_name: Optional[str] = "tiny"
    language: Optional[str] = None
    min_audio_threshold: Optional[float] = 0.001  # Lower default threshold

class TranscribeResponse(BaseModel):
    text: str
    language: str
    segments: List[dict]
    confidence: float
    rms_level: float

class TranslateRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    target_language: Optional[str] = "en"

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global whisper_service, translation_service
    
    print("[STARTUP] ========================================", flush=True)
    print("[STARTUP] Initializing ML Services...", flush=True)
    print("[STARTUP] ========================================", flush=True)
    
    # Initialize Whisper service
    print("[STARTUP] Creating WhisperService instance...", flush=True)
    whisper_service = WhisperService(model_name="tiny")
    
    # Pre-load the model (this may take time on first run)
    print("[STARTUP] Loading Whisper model (may take 30-60 seconds if downloading)...", flush=True)
    try:
        import time
        load_start = time.time()
        whisper_service.load_model()
        load_time = time.time() - load_start
        print(f"[STARTUP] OK Whisper model loaded successfully in {load_time:.2f} seconds", flush=True)
    except Exception as e:
        print(f"[STARTUP] ERROR loading Whisper model: {e}", flush=True)
        import traceback
        print("[STARTUP] Traceback:", flush=True)
        traceback.print_exc()
        print("[STARTUP] Model will be loaded on first transcription request", flush=True)
    
    # Initialize Translation service
    print("[STARTUP] Initializing Translation service...", flush=True)
    try:
        translation_service = TranslationService(
            target_language="en",
            model_type="local",
            use_fallback=True
        )
        print("[STARTUP] OK Translation service initialized", flush=True)
    except Exception as e:
        print(f"[STARTUP] ERROR initializing Translation service: {e}", flush=True)
        import traceback
        traceback.print_exc()
    
    print("[STARTUP] ========================================", flush=True)
    print("[STARTUP] Startup complete", flush=True)
    print("[STARTUP] ========================================", flush=True)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "whisper_loaded": whisper_service.model_loaded if whisper_service else False,
        "translation_loaded": translation_service._model_loaded if translation_service else False
    }

@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    model_name: str = Form("tiny"),
    language: Optional[str] = Form(None),
        min_audio_threshold: float = Form(0.001)  # Lower default threshold
):
    """
    Transcribe audio file to text
    
    Args:
        audio_file: Audio file (WAV, MP3, etc.)
        model_name: Whisper model name
        language: Language code (None for auto-detect)
        min_audio_threshold: Minimum RMS level for valid speech
    
    Returns:
        Transcription result
    """
    global whisper_service
    
    try:
        # Load model if needed or if model name changed
        if whisper_service is None or whisper_service.model_name != model_name:
            whisper_service = WhisperService(model_name=model_name)
        
        # Read audio file
        audio_bytes = await audio_file.read()
        
        # Convert to numpy array
        # For now, assume it's a WAV file or raw PCM
        # In production, use librosa or soundfile to handle various formats
        import wave
        import struct
        
        # Try to parse as WAV
        try:
            wav_io = io.BytesIO(audio_bytes)
            with wave.open(wav_io, 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                n_frames = wav_file.getnframes()
                audio_data = wav_file.readframes(n_frames)
                
                # Convert to numpy array (assuming 16-bit PCM)
                audio_array = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
        except Exception:
            # Fallback: assume raw float32 PCM at 16kHz
            audio_array = np.frombuffer(audio_bytes, dtype=np.float32)
            sample_rate = 16000
        
        # Transcribe
        result = whisper_service.transcribe(
            audio_array,
            sample_rate=sample_rate,
            language=language,
            min_audio_threshold=min_audio_threshold
        )
        
        return TranscribeResponse(
            text=result["text"],
            language=result["language"],
            segments=result.get("segments", []),
            confidence=result.get("confidence", 0.0),
            rms_level=result.get("rms_level", 0.0)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.post("/transcribe_bytes")
async def transcribe_audio_bytes(
    audio_data: bytes = File(...),
    sample_rate: int = Form(16000),
    model_name: str = Form("tiny"),
    language: Optional[str] = Form(None),
        min_audio_threshold: float = Form(0.001)  # Lower default threshold
):
    """
    Transcribe raw audio bytes (float32 PCM)
    
    Args:
        audio_data: Raw audio bytes (float32 PCM)
        sample_rate: Sample rate
        model_name: Whisper model name
        language: Language code
        min_audio_threshold: Minimum RMS level
    
    Returns:
        Transcription result
    """
    global whisper_service
    
    try:
        if whisper_service is None or whisper_service.model_name != model_name:
            whisper_service = WhisperService(model_name=model_name)
        
        # Validate input
        if not audio_data or len(audio_data) == 0:
            raise HTTPException(status_code=400, detail="Empty audio data received")
        
        if sample_rate <= 0:
            raise HTTPException(status_code=400, detail=f"Invalid sample rate: {sample_rate}")
        
        # Check minimum bytes (at least 4 bytes for one float32 sample)
        if len(audio_data) < 4:
            raise HTTPException(status_code=400, detail=f"Audio data too short: {len(audio_data)} bytes (need at least 4 for one float32 sample)")
        
        # Ensure the byte length is a multiple of 4 (float32 = 4 bytes)
        if len(audio_data) % 4 != 0:
            # Truncate to multiple of 4
            audio_data = audio_data[:len(audio_data) - (len(audio_data) % 4)]
            print(f"[WARN] Truncated audio data to {len(audio_data)} bytes (multiple of 4)")
        
        # Convert bytes to numpy array (float32)
        try:
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to convert bytes to float32 array: {e}")
        
        print(f"[DEBUG] Received audio: {len(audio_data)} bytes, {len(audio_array)} samples, sample_rate={sample_rate}, duration={len(audio_array)/sample_rate:.2f}s")
        print(f"[DEBUG] Audio stats: min={np.min(audio_array):.6f}, max={np.max(audio_array):.6f}, mean={np.mean(audio_array):.6f}, rms={np.sqrt(np.mean(audio_array**2)):.6f}")
        
        # Validate audio array
        if len(audio_array) == 0:
            raise HTTPException(status_code=400, detail="Audio array is empty after conversion")
        
        # Check for invalid values
        if np.any(np.isnan(audio_array)) or np.any(np.isinf(audio_array)):
            nan_count = np.sum(np.isnan(audio_array))
            inf_count = np.sum(np.isinf(audio_array))
            raise HTTPException(
                status_code=400, 
                detail=f"Audio data contains invalid values: {nan_count} NaN, {inf_count} Inf"
            )
        
        # Check minimum duration (at least 0.1 seconds)
        min_samples = int(sample_rate * 0.1)
        if len(audio_array) < min_samples:
            raise HTTPException(
                status_code=400, 
                detail=f"Audio too short: {len(audio_array)} samples (need at least {min_samples} for {sample_rate}Hz, duration={len(audio_array)/sample_rate:.3f}s)"
            )
        
        try:
            import time
            start_time = time.time()
            
            # Ensure model is loaded before transcription
            if not whisper_service.model_loaded:
                print("[DEBUG] Model not loaded, loading now (this may take 10-30 seconds)...")
                load_start = time.time()
                whisper_service.load_model()
                load_time = time.time() - load_start
                print(f"[DEBUG] Model loaded in {load_time:.2f} seconds")
            
            print(f"[DEBUG] Starting transcription: {len(audio_array)} samples, {len(audio_array)/sample_rate:.3f}s, threshold={min_audio_threshold}")
            print(f"[DEBUG] Transcription start time: {time.strftime('%H:%M:%S')}")
            result = whisper_service.transcribe(
                audio_array,
                sample_rate=sample_rate,
                language=language,
                min_audio_threshold=min_audio_threshold
            )
            elapsed_time = time.time() - start_time
            print(f"[DEBUG] Transcription completed in {elapsed_time:.2f}s: text='{result.get('text', '')[:50]}...', language={result.get('language', 'unknown')}, rms={result.get('rms_level', 0.0):.6f}")

            # #region agent log
            try:
                import json, os
                log_path = os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                    ".cursor",
                    "debug.log",
                )
                os.makedirs(os.path.dirname(log_path), exist_ok=True)
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "sessionId": "debug-session",
                        "runId": "pre-fix",
                        "hypothesisId": "H_PY_TRANSCRIBE",
                        "location": "ml-service/main.py:transcribe_bytes",
                        "message": "Transcription result from WhisperService",
                        "data": {
                            "text": result.get("text", ""),
                            "language": result.get("language", ""),
                            "rms_level": result.get("rms_level", 0.0),
                        },
                        "timestamp": __import__("time").time() * 1000,
                    }) + "\n")
            except Exception:
                pass
            # #endregion

            return TranscribeResponse(
                text=result["text"],
                language=result["language"],
                segments=result.get("segments", []),
                confidence=result.get("confidence", 0.0),
                rms_level=result.get("rms_level", 0.0)
            )
        except ValueError as ve:
            # ValueError from our validation - return 400
            print(f"[ERROR] Validation error: {ve}")
            raise HTTPException(status_code=400, detail=f"Validation error: {str(ve)}")
        except Exception as e:
            # Other errors - return 500 with full traceback
            import traceback
            error_trace = traceback.format_exc()
            print(f"[ERROR] Transcription exception: {e}")
            print(f"[ERROR] Full traceback:\n{error_trace}")
            raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any other exceptions in the outer try block
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ERROR] Outer exception: {e}")
        print(f"[ERROR] Full traceback:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

@app.post("/translate", response_model=TranslateResponse)
async def translate_text(request: TranslateRequest):
    """
    Translate text to target language
    
    Args:
        request: Translation request with text and language info
    
    Returns:
        Translation result
    """
    global translation_service
    
    try:
        if translation_service is None:
            translation_service = TranslationService(
                target_language=request.target_language,
                model_type="local",
                use_fallback=True
            )
        elif translation_service.target_language != request.target_language:
            translation_service.set_target_language(request.target_language)
        
        result = translation_service.translate(
            request.text,
            source_language=request.source_language
        )

        # #region agent log
        try:
            import json, os
            log_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                ".cursor",
                "debug.log",
            )
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "pre-fix",
                    "hypothesisId": "H_PY_TRANSLATE",
                    "location": "ml-service/main.py:translate",
                    "message": "TranslationService.translate result",
                    "data": {
                        "input_text": request.text,
                        "source_language": result.get("source_language"),
                        "target_language": result.get("target_language"),
                        "translated_text": result.get("translated_text"),
                        "error": result.get("error"),
                    },
                    "timestamp": __import__("time").time() * 1000,
                }) + "\n")
        except Exception:
            pass
        # #endregion

        # Log if there was an error in translation
        if "error" in result:
            print(f"[WARN] Translation had error: {result['error']}")
        
        return TranslateResponse(
            translated_text=result["translated_text"],
            source_language=result["source_language"],
            target_language=result["target_language"]
        )
    
    except Exception as e:
        import traceback
        print(f"[ERROR] Translation exception: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@app.post("/identify_speaker")
async def identify_speaker(
    audio_data: bytes = File(...),
    sample_rate: int = Form(16000)
):
    """
    Identify speaker from audio bytes (placeholder)
    """
    try:
        service = get_speaker_service()
        speaker_id = service.identify(audio_data, sample_rate=sample_rate)
        return {"speaker_id": speaker_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speaker identification error: {str(e)}")

@app.post("/learn_preference")
async def learn_preference_api(context: str = Form(...), translation: str = Form(...)):
    """Learn user preference for a given context."""
    try:
        learn_preference(context, translation)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning error: {str(e)}")

@app.post("/get_personalized_translation")
async def get_personalized_translation_api(context: str = Form(...)):
    """Get personalized translation for a context."""
    try:
        pref = get_personalized_translation(context)
        return {"preferred_translation": pref}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
