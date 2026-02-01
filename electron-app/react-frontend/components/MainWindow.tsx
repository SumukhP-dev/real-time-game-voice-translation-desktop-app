import { useEffect, useState, useCallback, useRef } from "react";
import { AudioSettings } from "./AudioSettings";
import { TranslationSettings } from "./TranslationSettings";
import { TranslationLog } from "./TranslationLog";
import { useTranslation } from "../hooks/useTranslation";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { useConfig } from "../hooks/useConfig";
import { useAudio } from "../hooks/useAudio";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import * as tauri from "../services/tauri";
import { invoke } from "@tauri-apps/api/tauri";
import { StatsDashboard } from "./StatsDashboard";
import { Benchmark } from "./Benchmark";
import { SetupWizard } from "./SetupWizard";
import { useTeammates } from "../hooks/useTeammates";
import { TranslationToTeam } from "./TranslationToTeam";
import { SubtitleSettings } from "./SubtitleSettings";
import { GameDetectionBadge } from "./GameDetectionBadge";
import { AntiCheatStatusComponent } from "./AntiCheatStatus";
import { HelpCenter } from "./HelpCenter";

export function MainWindow() {
  const { translate, targetLanguage } = useTranslation();
  const { config, updateConfig, loading: configLoading } = useConfig();
  const { t, language } = useI18n();
  const [status, setStatus] = useState<string>("Initializing...");

  // Update status text when language changes
  useEffect(() => {
    try {
      const initializingText = t(I18N_KEYS.STATUS_INITIALIZING);
      setStatus((prevStatus) => {
        if (
          prevStatus === "Initializing..." ||
          prevStatus.includes("Initializing")
        ) {
          return initializingText;
        }
        return prevStatus;
      });
    } catch (error) {
      console.error("Error updating status text:", error);
      // Keep default "Initializing..." if translation fails
    }
  }, [language, t]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslationActive, setIsTranslationActive] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [testOverlayText, setTestOverlayText] = useState<string | null>(null);
  const { recordTranslation, startMatchSession, endMatchSession } =
    useMatchHistory();
  const { isCapturing, stopCapture, startCapture, selectedDevice, devices } =
    useAudio();
  const { teammates } = useTeammates();

  // Use refs to persist values across renders without causing re-renders
  const lastProcessTimeRef = useRef<number>(0);
  const lastTimeoutCheckRef = useRef<number>(0);
  const timeoutResetInProgressRef = useRef<boolean>(false);
  const firstChunkLoggedRef = useRef<boolean>(false);

  // Add logging function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setStatusLogs((prev) => [...prev.slice(-49), logMessage]); // Keep last 50 logs
    setStatus(message); // Also update status
  }, []);

  // Check if setup is complete on mount
  useEffect(() => {
    if (config && !config.app?.setup_complete) {
      addLog("Setup wizard will be shown");
      setShowSetupWizard(true);
    } else if (config) {
      addLog("Setup complete, initializing...");
    }
  }, [config, addLog]);

  // Log device selection changes
  useEffect(() => {
    if (selectedDevice !== null && devices.length > 0) {
      const device = devices.find((d) => d.index === selectedDevice);
      if (device) {
        addLog(`Device selected: ${device.name}`);
      }
    }
  }, [selectedDevice, devices, addLog]);

  // Log capture status changes
  useEffect(() => {
    if (isCapturing) {
      addLog("Audio capture started");
    } else {
      addLog("Audio capture stopped");
    }
  }, [isCapturing, addLog]);

  useEffect(() => {
    // Start a default match session for tracking
    startMatchSession("General").catch((err) =>
      console.warn("Failed to start match session", err)
    );
    return () => {
      endMatchSession().catch((err) =>
        console.warn("Failed to end match session", err)
      );
    };
  }, [startMatchSession, endMatchSession]);

  useEffect(() => {
    // Reset processing state when effect starts (component mount or dependency change)
    setIsProcessing(false);
    lastProcessTimeRef.current = 0;
    lastTimeoutCheckRef.current = 0;
    timeoutResetInProgressRef.current = false;
    // Don't reset firstChunkLoggedRef - we only want to log once per session

    let audioChunkCount = 0;
    let lastLogTime = Date.now();
    let lowAudioCount = 0;
    let lastAudioLevelLog = Date.now();

    // Audio buffering for better transcription
    let audioBuffer: number[][] = [];
    let bufferStartTime = Date.now();
    const MIN_BUFFER_DURATION_MS = 1000; // Minimum 1 second before processing (faster response, less likely to timeout)
    // lastProcessTime is stored in lastProcessTimeRef to persist across renders
    const MIN_PROCESS_INTERVAL_MS = 500; // Small delay between processing to avoid overwhelming the ML service
    let lastBufferLogTime = Date.now();

    // Listen to audio chunks
    const unlisten = tauri.listenToAudioChunk(async (event) => {
      audioChunkCount++;
      const now = Date.now();

      // Log first audio chunk received (only once per session)
      if (audioChunkCount === 1 && !firstChunkLoggedRef.current) {
        firstChunkLoggedRef.current = true;
        addLog("✓ First audio chunk received - capture is working!");
      }

      // Log audio chunk details every 50 chunks
      if (audioChunkCount % 50 === 0 && audioChunkCount > 0) {
        const rms = Math.sqrt(
          event.data.reduce((sum, val) => sum + val * val, 0) /
            event.data.length
        );
        const peak = Math.max(...event.data.map(Math.abs));
        addLog(
          `Received ${audioChunkCount} chunks (RMS=${rms.toFixed(
            6
          )}, peak=${peak.toFixed(6)})`
        );
      }

      // Log every 5 seconds that we're receiving audio
      if (now - lastLogTime > 5000) {
        const logMsg = `Received ${audioChunkCount} audio chunks (last 5s), ${lowAudioCount} were too quiet, buffer size: ${audioBuffer.length}`;
        console.log(logMsg);
        addLog(logMsg);

        // Provide helpful status message
        if (lowAudioCount === audioChunkCount && audioChunkCount > 0) {
          const statusMsg = `Receiving audio but it's very quiet (${audioChunkCount} chunks). Check: 1) Audio device is correct, 2) Game audio is playing, 3) Device volume is up`;
          setStatus(statusMsg);
          addLog(statusMsg);
        } else {
          const statusMsg = `Receiving audio... (${audioChunkCount} chunks, ${lowAudioCount} quiet)`;
          setStatus(statusMsg);
        }
        lastLogTime = now;
        audioChunkCount = 0;
        lowAudioCount = 0;
      }

      // Check if translation is active
      if (!isTranslationActive) {
        audioBuffer = []; // Clear buffer when translation is inactive
        return;
      }

      // Check if audio data is meaningful (not just silence)
      // Use a lower threshold for better sensitivity
      const AUDIO_THRESHOLD = 0.001; // Very low threshold - let Whisper decide if there's speech
      const audioLevel = Math.sqrt(
        event.data.reduce((sum, val) => sum + val * val, 0) / event.data.length
      );

      // Also check peak level (max absolute value) for better detection
      const peakLevel = Math.max(...event.data.map(Math.abs));

      // Safety check: if isProcessing has been true for too long (>60s), reset it
      // This prevents the buffer from growing indefinitely if processing gets stuck
      // Whisper transcription can take 15-30 seconds for longer audio clips
      if (isProcessing && !timeoutResetInProgressRef.current) {
        // If lastProcessTimeRef is 0, it means processing was set but timestamp wasn't recorded
        // This is a bug state - reset it silently (don't log, just fix it)
        if (lastProcessTimeRef.current === 0) {
          timeoutResetInProgressRef.current = true;
          setIsProcessing(false);
          lastProcessTimeRef.current = 0;
          lastTimeoutCheckRef.current = 0;
          // Reset flag after a short delay
          setTimeout(() => {
            timeoutResetInProgressRef.current = false;
          }, 1000);
          // Continue to process the buffer
          return; // Exit early to avoid processing this chunk
        } else {
          // Validate that lastProcessTimeRef is reasonable (not from the future or too old)
          const timeSinceStart = now - lastProcessTimeRef.current;

          // If timestamp is invalid (negative or way too large), reset it
          if (timeSinceStart < 0 || timeSinceStart > 120000) {
            console.warn("Invalid lastProcessTimeRef detected, resetting", {
              timeSinceStart,
              lastProcessTime: lastProcessTimeRef.current,
              now,
            });
            timeoutResetInProgressRef.current = true;
            setIsProcessing(false);
            lastProcessTimeRef.current = 0;
            lastTimeoutCheckRef.current = 0;
            // Reset flag after a short delay
            setTimeout(() => {
              timeoutResetInProgressRef.current = false;
            }, 1000);
            // Continue to process the buffer
          } else {
            // Only check timeout every 5 seconds to avoid spam
            // Initialize lastTimeoutCheckRef if it's 0 (first check)
            if (lastTimeoutCheckRef.current === 0) {
              lastTimeoutCheckRef.current = now;
            }

            const timeSinceLastCheck = now - lastTimeoutCheckRef.current;
            if (timeSinceLastCheck >= 5000) {
              lastTimeoutCheckRef.current = now;

              const processingTimeout = 120000; // 120 seconds (to match transcription timeout + buffer)

              if (timeSinceStart > processingTimeout) {
                console.warn(
                  "Processing timeout detected, resetting isProcessing flag",
                  {
                    timeSinceStart,
                    lastProcessTime: lastProcessTimeRef.current,
                    now,
                  }
                );
                timeoutResetInProgressRef.current = true;
                addLog("⚠ Processing timeout - resetting state");
                setIsProcessing(false);
                lastProcessTimeRef.current = 0; // Reset to allow new processing
                lastTimeoutCheckRef.current = 0; // Reset timeout check ref
                // Reset flag after a short delay
                setTimeout(() => {
                  timeoutResetInProgressRef.current = false;
                }, 1000);
                // Continue to process the buffer
              } else {
                // Still processing, add to buffer but don't process new chunks
                if (
                  audioLevel >= AUDIO_THRESHOLD ||
                  peakLevel >= AUDIO_THRESHOLD * 3
                ) {
                  audioBuffer.push(event.data);
                }
                return;
              }
            } else {
              // Still processing, add to buffer but don't process new chunks
              if (
                audioLevel >= AUDIO_THRESHOLD ||
                peakLevel >= AUDIO_THRESHOLD * 3
              ) {
                audioBuffer.push(event.data);
              }
              return;
            }
          }
        }
      }

      // Log audio levels periodically for debugging
      if (now - lastAudioLevelLog > 2000) {
        console.log(
          "Audio levels:",
          `RMS=${audioLevel.toFixed(6)}, peak=${peakLevel.toFixed(
            6
          )}, threshold=${AUDIO_THRESHOLD}`,
          "buffer chunks:",
          audioBuffer.length
        );
        lastAudioLevelLog = now;
      }

      // Use both RMS and peak level for detection
      // Peak level is often higher and can detect quiet speech better
      const isCompletelySilent = audioLevel === 0 && peakLevel === 0;

      // Skip completely silent audio entirely - don't even add to buffer
      if (isCompletelySilent) {
        lowAudioCount++;
        // Log warning periodically about silent audio
        if (lowAudioCount % 1000 === 0) {
          addLog(
            "⚠ Audio is completely silent (RMS=0). Set Windows Playback Device to 'CABLE Input (VB-Audio Virtual Cable)' and play audio."
          );
        }
        // Clear buffer if we've been silent for too long
        if (audioBuffer.length > 0 && now - bufferStartTime > 3000) {
          console.log("Clearing audio buffer due to extended silence");
          audioBuffer = [];
        }
        return;
      }

      // Only skip completely silent audio (RMS = 0 or extremely close to 0)
      // Let Whisper decide if there's speech in quiet audio
      if (audioLevel < 0.0001 && peakLevel < 0.0005) {
        // Essentially silent - skip but keep buffer for a bit
        lowAudioCount++;
        if (lowAudioCount % 50 === 0) {
          console.log(
            "Audio essentially silent, skipping. RMS:",
            audioLevel.toFixed(6),
            "Peak:",
            peakLevel.toFixed(6),
            "Count:",
            lowAudioCount
          );
        }
        // If we've been silent for too long, clear the buffer
        if (audioBuffer.length > 0 && now - bufferStartTime > 3000) {
          console.log("Clearing audio buffer due to extended silence");
          audioBuffer = [];
        }
        return;
      }

      // Add to buffer (only if audio has some level)
      audioBuffer.push(event.data);
      if (audioBuffer.length === 1) {
        bufferStartTime = now;
      }

      // Calculate actual audio duration from samples (more accurate than time-based)
      const totalSamples = audioBuffer.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );
      const actualAudioDurationMs = (totalSamples / event.sample_rate) * 1000;
      const bufferDuration = now - bufferStartTime;
      const timeSinceLastProcess =
        lastProcessTimeRef.current === 0
          ? Infinity
          : now - lastProcessTimeRef.current;

      // Process if we have enough audio (at least 1.0s to account for stereo-to-mono and resampling)
      // The ML service converts stereo to mono (halves samples) and resamples 48kHz->16kHz (reduces by 3x)
      // So we need: 0.5s at 16kHz = 8000 samples
      // After conversions: 8000 * 3 (resample) * 2 (stereo) = 48000 samples at 48kHz = 1.0s
      // Also process if buffer is getting too large (max 4s) OR if many chunks have accumulated (stall prevention)
      const MIN_AUDIO_DURATION_MS = 1000; // At least 1.0 seconds of audio to account for conversions
      const shouldProcess =
        (actualAudioDurationMs >= MIN_AUDIO_DURATION_MS &&
          timeSinceLastProcess >= MIN_PROCESS_INTERVAL_MS) ||
        actualAudioDurationMs >= 4000 ||
        audioBuffer.length >= 200; // stall guard: force process if 200 chunks buffered

      // Log buffer status periodically
      if (audioBuffer.length > 0 && now - lastBufferLogTime > 2000) {
        const totalSamples = audioBuffer.reduce(
          (sum, chunk) => sum + chunk.length,
          0
        );
        console.log("Buffer status:", {
          chunks: audioBuffer.length,
          totalSamples: totalSamples,
          duration: bufferDuration.toFixed(0) + "ms",
          timeSinceLastProcess:
            timeSinceLastProcess === Infinity
              ? "never"
              : timeSinceLastProcess.toFixed(0) + "ms",
          shouldProcess,
          isProcessing,
          minBufferDuration: MIN_BUFFER_DURATION_MS + "ms",
          minProcessInterval: MIN_PROCESS_INTERVAL_MS + "ms",
        });
        addLog(
          `Buffer: ${audioBuffer.length} chunks, ${totalSamples} samples, ${(
            actualAudioDurationMs / 1000
          ).toFixed(
            2
          )}s, shouldProcess=${shouldProcess}, isProcessing=${isProcessing}`
        );
        lastBufferLogTime = now;
      }

      // Force process if buffer is getting too large (safety mechanism)
      if (audioBuffer.length >= 200 && !isProcessing) {
        addLog(
          `⚠ Buffer too large (${audioBuffer.length} chunks), forcing processing`
        );
      }

      // Safety: Clear buffer if it grows too large (prevents memory issues)
      const MAX_BUFFER_CHUNKS = 500; // Maximum 500 chunks (~10 seconds at 48kHz)
      if (audioBuffer.length > MAX_BUFFER_CHUNKS) {
        const droppedChunks = audioBuffer.length - MAX_BUFFER_CHUNKS;
        audioBuffer = audioBuffer.slice(-MAX_BUFFER_CHUNKS); // Keep only the most recent chunks
        addLog(
          `⚠ Buffer exceeded ${MAX_BUFFER_CHUNKS} chunks, dropped ${droppedChunks} old chunks`
        );
        bufferStartTime = now; // Reset buffer start time
      }

      // Reset buffer start time if buffer was cleared (prevents stale timestamps)
      if (audioBuffer.length === 0) {
        bufferStartTime = now;
      }

      // Only process if not already processing AND enough time has passed since last process
      // (timeSinceLastProcess is already declared above, reuse it)
      const canProcess =
        !isProcessing && timeSinceLastProcess >= MIN_PROCESS_INTERVAL_MS;

      if (shouldProcess && audioBuffer.length > 0 && canProcess) {
        // Recalculate actual audio duration before processing
        const processingTotalSamples = audioBuffer.reduce(
          (sum, chunk) => sum + chunk.length,
          0
        );
        const processingAudioDurationMs =
          (processingTotalSamples / event.sample_rate) * 1000;

        // CRITICAL: Double-check we have at least 1.0s before processing
        // This prevents premature processing due to race conditions or other triggers
        if (processingAudioDurationMs < 1000) {
          console.log(
            `[DEBUG] Skipping processing: only ${processingAudioDurationMs.toFixed(
              0
            )}ms, need 1000ms`
          );
          return; // Skip processing, wait for more audio
        }

        // Set processing flag IMMEDIATELY to prevent concurrent requests
        setIsProcessing(true);
        const logMsg = `Processing buffer now (chunks=${
          audioBuffer.length
        }, duration=${processingAudioDurationMs.toFixed(0)}ms)`;
        console.log("=== PROCESSING BUFFER ===", {
          chunks: audioBuffer.length,
          duration: processingAudioDurationMs.toFixed(0) + "ms",
          timeSinceLastProcess:
            timeSinceLastProcess === Infinity
              ? "never"
              : timeSinceLastProcess.toFixed(0) + "ms",
          timestamp: new Date().toISOString(),
        });
        addLog(logMsg);
        // Combine all buffered audio chunks
        const totalLength = audioBuffer.reduce(
          (sum, chunk) => sum + chunk.length,
          0
        );
        const combinedAudio = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of audioBuffer) {
          combinedAudio.set(new Float32Array(chunk), offset);
          offset += chunk.length;
        }

        // Clear buffer
        audioBuffer = [];
        lastProcessTimeRef.current = now;

        // Processing flag was already set above to prevent concurrent requests
        addLog(
          `Processing audio buffer: ${combinedAudio.length} samples, ${(
            combinedAudio.length / event.sample_rate
          ).toFixed(2)}s`
        );
        setStatus("Processing audio...");

        try {
          // Transcribe audio
          const avgLevel = Math.sqrt(
            combinedAudio.reduce((sum, val) => sum + val * val, 0) /
              combinedAudio.length
          );
          const peakLevel = Math.max(
            ...Array.from(combinedAudio).map(Math.abs)
          );

          // Skip transcription if audio is completely silent
          if (avgLevel === 0 && peakLevel === 0) {
            const skipMsg =
              "Skipping transcription: audio is completely silent (RMS=0)";
            console.log(skipMsg);
            addLog(skipMsg);
            setStatus("Audio is silent - check Windows audio routing");
            setIsProcessing(false);
            return;
          }

          addLog(
            `Audio level: RMS=${avgLevel.toFixed(6)}, peak=${peakLevel.toFixed(
              6
            )}, sending ${combinedAudio.length} samples for transcription`
          );

          // Validate audio before sending
          if (combinedAudio.length === 0) {
            const errorMsg = "Cannot transcribe: audio array is empty";
            console.error(errorMsg);
            addLog(errorMsg);
            setStatus("Error: No audio data to transcribe");
            setIsProcessing(false);
            return;
          }

          // Check for invalid values
          const hasInvalid = combinedAudio.some((val) => !isFinite(val));
          if (hasInvalid) {
            console.error(
              "Cannot transcribe: audio contains invalid values (NaN/Inf)"
            );
            setStatus("Error: Invalid audio data");
            setIsProcessing(false);
            return;
          }

          // Check minimum duration (at least 1.0 seconds to account for stereo-to-mono and resampling)
          // After stereo-to-mono (halves) and 48kHz->16kHz resampling (reduces by 3x), we need:
          // 0.5s at 16kHz = 8000 samples
          // Original needed: 8000 * 3 * 2 = 48000 samples at 48kHz = 1.0s
          const minSamples = Math.floor(event.sample_rate * 1.0); // 1.0 second minimum
          if (combinedAudio.length < minSamples) {
            console.error(
              `Cannot transcribe: audio too short (${
                combinedAudio.length
              } samples, ${(combinedAudio.length / event.sample_rate).toFixed(
                3
              )}s, need at least ${minSamples} samples / ${(
                minSamples / event.sample_rate
              ).toFixed(1)}s)`
            );
            setStatus("Error: Audio too short - need at least 1.0s");
            setIsProcessing(false);
            return;
          }

          const transcribeLog = `Transcribing: ${
            combinedAudio.length
          } samples, ${(combinedAudio.length / event.sample_rate).toFixed(
            2
          )}s, RMS=${avgLevel.toFixed(6)}`;

          // #region agent log
          fetch(
            "http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: "debug-session",
                runId: "pre-fix",
                hypothesisId: "H4",
                location: "MainWindow.tsx:beforeTranscribe",
                message: "About to call transcribeAudio",
                data: {
                  length: combinedAudio.length,
                  durationSec: combinedAudio.length / event.sample_rate,
                  rms: avgLevel,
                },
                timestamp: Date.now(),
              }),
            }
          ).catch(() => {});
          // #endregion

          console.log("=== TRANSCRIBING ===", transcribeLog);
          addLog(transcribeLog);

          let transcription;
          const transcriptionStartTime = Date.now(); // Declare outside try block for error handling
          try {
            console.log("[DEBUG] Calling transcribeAudio with:", {
              audioLength: combinedAudio.length,
              sampleRate: event.sample_rate,
              audioPreview: combinedAudio.slice(0, 10),
              timestamp: new Date().toISOString(),
            });
            addLog(
              `[DEBUG] Sending transcription request: ${
                combinedAudio.length
              } samples, ${(combinedAudio.length / event.sample_rate).toFixed(
                2
              )}s`
            );

            // Add timeout wrapper to prevent hanging
            addLog(`[DEBUG] Creating transcription promise...`);
            const transcriptionPromise = tauri.transcribeAudio(
              Array.from(combinedAudio),
              event.sample_rate
            );

            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () =>
                  reject(
                    new Error(
                      "Transcription timeout after 90 seconds - ML service may be slow or loading model"
                    )
                  ),
                90000 // Increased to 90 seconds to allow for model loading on first request
              );
            });

            addLog(`[DEBUG] Starting Promise.race (timeout: 90s)...`);
            transcription = (await Promise.race([
              transcriptionPromise,
              timeoutPromise,
            ])) as any;
            const duration = Date.now() - transcriptionStartTime;
            addLog(
              `[DEBUG] Promise.race completed in ${duration}ms, got transcription: ${
                transcription ? "YES" : "NO"
              }`
            );

            console.log(
              `[DEBUG] Transcription response received (took ${duration}ms):`,
              {
                hasText: !!transcription?.text,
                textLength: transcription?.text?.length,
                text: transcription?.text,
                language: transcription?.language,
                rms_level: transcription?.rms_level,
                fullResponse: transcription,
              }
            );
            addLog(
              `[DEBUG] Transcription completed in ${(duration / 1000).toFixed(
                1
              )}s: hasText=${!!transcription?.text}, text="${(
                transcription?.text || "(empty)"
              ).substring(0, 50)}"`
            );

            // #region agent log
            fetch(
              "http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: "debug-session",
                  runId: "pre-fix",
                  hypothesisId: "H5",
                  location: "MainWindow.tsx:afterTranscribe",
                  message: "Received transcription result",
                  data: {
                    text: transcription?.text,
                    language: transcription?.language,
                    rms_level: transcription?.rms_level,
                  },
                  timestamp: Date.now(),
                }),
              }
            ).catch(() => {});
            // #endregion

            if (!transcription) {
              throw new Error("Transcription returned null/undefined");
            }
          } catch (transcribeError) {
            const errorTime = Date.now();
            const processingDuration = errorTime - transcriptionStartTime;
            console.error("[ERROR] Transcription failed:", transcribeError);
            console.error(
              "[ERROR] Full error object:",
              JSON.stringify(transcribeError, null, 2)
            );
            console.error(
              `[ERROR] Processing took ${processingDuration}ms before failure`
            );
            const errorMsg =
              transcribeError instanceof Error
                ? transcribeError.message
                : String(transcribeError);
            const detailedError = `[ERROR] Transcription failed after ${processingDuration}ms: ${errorMsg}`;
            console.error(detailedError);
            addLog(detailedError);

            // Check if it's a timeout
            if (errorMsg.includes("timeout")) {
              addLog(
                "⚠ ML service may be overloaded or Whisper model is too slow. Try using a smaller model (tiny) or check ML service logs."
              );
              // Clear the buffer to prevent it from growing indefinitely
              audioBuffer = [];
              addLog("⚠ Cleared audio buffer due to timeout");
            }

            setStatus(`Transcription error: ${errorMsg}`);
            setIsProcessing(false);
            return; // Exit early on transcription error
          }

          console.log(
            "=== TRANSCRIPTION RESULT ===",
            JSON.stringify(transcription, null, 2)
          );

          // Log transcription result details for debugging
          const transcriptionDebug = `[DEBUG] Transcription received: text="${
            transcription?.text || "(empty)"
          }", language="${transcription?.language || "unknown"}", rms=${
            transcription?.rms_level || 0
          }`;
          console.log(transcriptionDebug);
          addLog(transcriptionDebug);

          // Check if transcription returned empty text
          if (
            !transcription ||
            !transcription.text ||
            transcription.text.trim().length === 0
          ) {
            const emptyLog = `⚠ Transcription returned empty text. Audio may be too quiet or contain no speech. RMS=${
              transcription?.rms_level || 0
            }`;
            console.warn(emptyLog);
            addLog(emptyLog);
            setStatus("Transcription: No speech detected");
            setIsProcessing(false);
            return; // Exit early if no text
          }

          if (
            transcription &&
            transcription.text &&
            transcription.text.trim().length > 0
          ) {
            const transcribeSuccess = `✓ Transcription: "${transcription.text}" (${transcription.language})`;
            console.log("✓ Transcription successful:", transcription.text);
            addLog(transcribeSuccess);
            setStatus(`Transcribed: ${transcription.text}`);

            // Auto-detect teammate language from transcription
            // This automatically creates/updates teammates based on detected languages
            try {
              const detectedTeammate = await tauri.autoDetectTeammateLanguage(
                transcription.language,
                undefined // Auto-generate teammate name based on language
              );
              console.log(
                `Auto-detected language ${transcription.language} for teammate: ${detectedTeammate}`
              );
              addLog(
                `✓ Auto-detected teammate: ${detectedTeammate} (${transcription.language})`
              );
            } catch (error) {
              console.warn("Failed to auto-detect teammate language:", error);
            }

            // Translate
            let translation;
            try {
              console.log("=== CALLING TRANSLATE ===", {
                text: transcription.text,
                sourceLanguage: transcription.language,
                targetLanguage: targetLanguage,
              });
              translation = await translate(
                transcription.text,
                transcription.language
              );
              // #region agent log
              fetch(
                "http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId: "debug-session",
                    runId: "pre-fix",
                    hypothesisId: "H6",
                    location: "MainWindow.tsx:afterTranslate",
                    message: "Translation completed in MainWindow pipeline",
                    data: {
                      original: transcription.text,
                      translated: translation?.translated,
                      sourceLanguage: translation?.sourceLanguage,
                      targetLanguage: translation?.targetLanguage,
                    },
                    timestamp: Date.now(),
                  }),
                }
              ).catch(() => {});
              // #endregion

              console.log("=== TRANSLATION RESULT ===", translation);
              addLog(
                `[DEBUG] Translation result: ${JSON.stringify(
                  translation,
                  null,
                  2
                )}`
              );
            } catch (error) {
              console.error("Translation error:", error);
              const errorMsg =
                error instanceof Error
                  ? error.message
                  : String(error) || "Unknown error";
              addLog(`✗ Translation failed: ${errorMsg}`);
              addLog(
                `[DEBUG] Translation error details: ${JSON.stringify(
                  error,
                  null,
                  2
                )}`
              );
              setStatus(`Translation failed: ${errorMsg}`);
              // Don't return here - let finally block run to reset isProcessing
            }

            if (translation) {
              addLog(`[DEBUG] Translation exists, checking overlay display...`);
              const translateLog = `✓ Translation: "${transcription.text}" → "${translation.translated}" (${translation.sourceLanguage}→${translation.targetLanguage})`;
              console.log("=== TRANSLATION SUCCESS ===", {
                original: transcription.text,
                translated: translation.translated,
                source: translation.sourceLanguage,
                target: translation.targetLanguage,
                fullTranslation: translation,
              });
              addLog(translateLog);
              setStatus(`Translated: ${translation.translated}`);

              // Record translation for history
              try {
                await recordTranslation({
                  original: transcription.text,
                  translated: translation.translated,
                  source_lang: transcription.language,
                  target_lang: translation.targetLanguage,
                });
                console.log("✓ Translation recorded in history");
              } catch (recordError) {
                console.warn("Failed to record translation:", recordError);
              }

              // Show on overlay - always show if overlay is enabled
              const overlayEnabled = config?.overlay?.enabled ?? true;
              const shouldShowOverlay = overlayEnabled; // Always show when enabled
              addLog(
                `[DEBUG] Overlay check: enabled=${overlayEnabled}, shouldShow=${shouldShowOverlay}, config=${JSON.stringify(
                  config?.overlay
                )}`
              );

              // Translate to team language if enabled
              const translateToTeammates =
                config?.translation?.translate_to_teammates ?? false;
              const useAutoDetect =
                config?.translation?.use_auto_detect_team_language ?? false;
              const manualTeamTargetLanguage =
                config?.translation?.team_target_language || "en";

              // Calculate most common language from teammates if auto-detect is enabled
              let effectiveTeamLanguage = manualTeamTargetLanguage;
              if (useAutoDetect && teammates.length > 0) {
                const languageCounts: Record<string, number> = {};
                teammates.forEach((t) => {
                  if (t.primary_language) {
                    languageCounts[t.primary_language] =
                      (languageCounts[t.primary_language] || 0) + 1;
                  }
                  Object.entries(t.detected_languages || {}).forEach(
                    ([lang, count]) => {
                      languageCounts[lang] =
                        (languageCounts[lang] || 0) + (count as number);
                    }
                  );
                });

                let maxCount = 0;
                let mostCommon = null;
                Object.entries(languageCounts).forEach(([lang, count]) => {
                  if (count > maxCount) {
                    maxCount = count;
                    mostCommon = lang;
                  }
                });

                if (mostCommon) {
                  effectiveTeamLanguage = mostCommon;
                }
              }

              const teammateTranslations: Array<{
                name: string;
                language: string;
                text: string;
              }> = [];

              if (translateToTeammates) {
                // Use effective team language (manual or auto-detected)
                if (
                  effectiveTeamLanguage !== translation.targetLanguage &&
                  effectiveTeamLanguage !== translation.sourceLanguage
                ) {
                  try {
                    const teamTranslation = await translate(
                      transcription.text,
                      translation.sourceLanguage,
                      effectiveTeamLanguage
                    );
                    if (teamTranslation) {
                      teammateTranslations.push({
                        name: "Team",
                        language: effectiveTeamLanguage,
                        text: teamTranslation.translated,
                      });
                      addLog(
                        `→ Team (${effectiveTeamLanguage}${
                          useAutoDetect ? " [auto]" : ""
                        }): "${teamTranslation.translated}"`
                      );
                    }
                  } catch (err) {
                    console.warn(
                      `Failed to translate to team language (${effectiveTeamLanguage}):`,
                      err
                    );
                  }
                }
              }

              if (shouldShowOverlay) {
                try {
                  // Show main translation
                  const overlayLog = `Showing overlay: "${translation.translated}"`;
                  console.log("=== SHOWING OVERLAY ===", {
                    text: translation.translated,
                    overlayEnabled,
                    sourceLang: translation.sourceLanguage,
                    targetLang: translation.targetLanguage,
                    showSameLanguage: config?.overlay?.show_same_language,
                    teammateTranslations: teammateTranslations.length,
                  });
                  addLog(overlayLog);
                  addLog(
                    `[DEBUG] Calling show_overlay_text with: "${overlayText}"`
                  );

                  // Combine main translation with teammate translations
                  // Team translations are always shown in overlay when available
                  let overlayText = translation.translated;
                  if (teammateTranslations.length > 0) {
                    const teammateTexts = teammateTranslations
                      .map((t) => `${t.name}: ${t.text}`)
                      .join(" | ");
                    overlayText = `${translation.translated}\n${teammateTexts}`;
                  }

                  addLog(`[DEBUG] About to invoke show_overlay_text...`);
                  const result = await invoke("show_overlay_text", {
                    text: overlayText,
                  });
                  console.log("✓ Overlay command succeeded:", result);
                  addLog(
                    `✓ Overlay displayed successfully. Result: ${JSON.stringify(
                      result
                    )}`
                  );
                  addLog(`[DEBUG] Overlay invoke completed without error`);
                } catch (error) {
                  const errorMsg = `✗ Failed to show overlay: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`;
                  console.error("✗ Failed to show overlay:", error);
                  console.error(
                    "Error details:",
                    JSON.stringify(error, null, 2)
                  );
                  addLog(errorMsg);
                  addLog(
                    `[DEBUG] Overlay error full details: ${JSON.stringify(
                      error,
                      null,
                      2
                    )}`
                  );
                }
              } else {
                const skipLog = `Overlay skipped: ${
                  translation.sourceLanguage === translation.targetLanguage
                    ? "same language"
                    : "overlay disabled"
                }`;
                console.log("✗ Overlay not shown - reasons:", {
                  overlayEnabled,
                  shouldShowOverlay,
                  sourceLang: translation.sourceLanguage,
                  targetLang: translation.targetLanguage,
                  showSameLanguage: config?.overlay?.show_same_language,
                  languagesMatch:
                    translation.sourceLanguage === translation.targetLanguage,
                });
                addLog(skipLog);
              }

              // Record translation in match history (only once)
              try {
                console.log("=== RECORDING TRANSLATION ===", {
                  original: transcription.text,
                  translated: translation.translated,
                  source_lang: transcription.language,
                  target_lang: translation.targetLanguage || "",
                });
                await recordTranslation({
                  original: transcription.text,
                  translated: translation.translated,
                  source_lang: transcription.language,
                  target_lang: translation.targetLanguage || "",
                  teammate: undefined,
                });
                console.log("✓ Translation recorded in history successfully");
              } catch (error) {
                console.error("Failed to record translation:", error);
                addLog(
                  `⚠ Failed to record translation: ${
                    error instanceof Error ? error.message : String(error)
                  }`
                );
              }
            }
          } else {
            const noSpeechLog = `✗ No speech detected (RMS=${avgLevel.toFixed(
              6
            )})`;
            console.log(
              "✗ No text in transcription - empty or whitespace only. Transcription object:",
              transcription
            );
            console.log("Transcription details:", {
              text: transcription?.text,
              language: transcription?.language,
              rms_level: transcription?.rms_level,
              hasText: !!transcription?.text,
              textLength: transcription?.text?.length,
              trimmedLength: transcription?.text?.trim().length,
            });
            addLog(noSpeechLog);
            addLog(
              `[DEBUG] Transcription was empty. text="${
                transcription?.text || "(null)"
              }", language="${transcription?.language || "unknown"}"`
            );
            setStatus("No speech detected in audio");
          }
        } catch (error) {
          console.error("Processing error:", error);
          console.error("Error type:", typeof error);
          console.error("Error details:", JSON.stringify(error, null, 2));

          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else if (error && typeof error === "object") {
            // Try to extract message from error object
            const err = error as any;
            errorMessage =
              err.message ||
              err.error ||
              err.toString() ||
              JSON.stringify(error);
          }

          const errorLog = `✗ Error: ${errorMessage}`;
          addLog(errorLog);
          setStatus(`Error: ${errorMessage}`);
        } finally {
          setIsProcessing(false);
          lastProcessTimeRef.current = 0; // Reset timestamp when processing completes
        }
      }
    });

    return () => {
      console.log("Cleaning up audio listener...");
      unlisten
        .then((fn) => {
          fn();
          console.log("Audio listener cleaned up");
        })
        .catch((err) => {
          console.error("Error cleaning up audio listener:", err);
        });
    };
  }, [
    translate,
    isProcessing,
    recordTranslation,
    config,
    targetLanguage,
    isTranslationActive,
    addLog,
    teammates,
  ]);

  // Cleanup on unmount (when window closes)
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      console.log("Component unmounting, performing cleanup...");
      (async () => {
        try {
          if (isCapturing) {
            await stopCapture();
          }
          // Don't pause translation on cleanup - let it continue running
          // setIsTranslationActive(false);
          await endMatchSession();
          console.log("Cleanup complete");
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      })();
    };
  }, [isCapturing, stopCapture, endMatchSession]);

  // Show loading state if config is still loading (AFTER all hooks are called)
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Loading configuration...</h2>
          <p className="text-gray-400">
            Please wait while the app initializes.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            If this takes more than 10 seconds, check the console (F12) for
            errors.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {testOverlayText && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="px-4 py-2 bg-black bg-opacity-80 rounded-lg border border-white/30 shadow-xl text-white text-lg pointer-events-auto">
            {testOverlayText}
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                CS:GO 2 Voice Translation
              </h1>
              <p className="text-gray-400">
                Real-time voice translation for gaming
              </p>
            </div>
            <div className="flex gap-2 items-center flex-shrink-0">
              <button
                onClick={() => setShowHelpCenter(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                title="Open Help Center"
              >
                Help
              </button>
              <button
                onClick={() => setShowSetupWizard(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                title="Open Setup Wizard"
              >
                Setup Wizard
              </button>
              <button
                onClick={async () => {
                  try {
                    const testText =
                      "Test: Overlay is working via Python overlay";
                    addLog("Testing Python overlay with sample text...");
                    console.log("=== TEST OVERLAY BUTTON CLICKED (PYTHON) ===");

                    // Directly call Python overlay (no ML service needed)
                    const result = await tauri.showPythonOverlay(testText);
                    console.log("Python overlay result:", result);

                    // Also show the in-app banner so you get instant feedback
                    setTestOverlayText(testText);
                    setTimeout(() => setTestOverlayText(null), 4000);

                    addLog(`✓ ${result}`);
                  } catch (err) {
                    console.error("Test overlay error:", err);
                    const errorMsg =
                      err instanceof Error
                        ? err.message
                        : String(err) || "Unknown error";
                    addLog(`✗ Test overlay failed: ${errorMsg}`);

                    // Show error details in console for debugging
                    console.error("Full error object:", err);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                title="Test Overlay"
              >
                Test Overlay
              </button>
            </div>
          </div>
          <div className="mt-2 p-2 bg-gray-800 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {t(I18N_KEYS.MAIN_STATUS)}: {status}
                </span>
                {!isTranslationActive && (
                  <span className="ml-2 text-sm text-yellow-400">
                    (Translation paused)
                  </span>
                )}
                <GameDetectionBadge />
              </div>
              <div className="flex gap-2">
                {isCapturing && (
                  <span className="px-3 py-2 bg-green-900 text-green-200 rounded text-sm">
                    ● Capturing
                  </span>
                )}
                {!isCapturing && (
                  <span className="px-3 py-2 bg-gray-700 text-gray-300 rounded text-sm">
                    ○ Not Capturing
                  </span>
                )}
              </div>
            </div>
            {isCapturing &&
              (status.includes("very quiet") ||
                status.includes("RMS=0.000000")) && (
                <div className="mt-2 p-2 bg-yellow-900 text-yellow-200 rounded text-xs">
                  ⚠ Audio is silent (RMS=0). Set Windows Playback Device to
                  "CABLE Input (VB-Audio Virtual Cable)" and play audio to test.
                </div>
              )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AudioSettings />
            <TranslationSettings />
            <SubtitleSettings />
            <TranslationToTeam />
          </div>
          <div className="space-y-6">
            <TranslationLog />
            {/* Status Logs Panel */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-white">
                {t(I18N_KEYS.MAIN_STATUS)} Logs
              </h2>
              <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto font-mono text-xs">
                {statusLogs.length === 0 ? (
                  <p className="text-gray-500">No logs yet...</p>
                ) : (
                  statusLogs.map((log, idx) => (
                    <div key={idx} className="text-gray-300 mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setStatusLogs([])}
                className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                {t(I18N_KEYS.COMMON_CLEAR)} Logs
              </button>
            </div>
            <StatsDashboard />
            <AntiCheatStatusComponent />
            <Benchmark />
          </div>
        </div>
      </div>

      {/* Setup Wizard */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={() => {
            setShowSetupWizard(false);
            setStatus("Setup complete! Ready to translate.");
          }}
          onClose={() => setShowSetupWizard(false)}
        />
      )}

      {/* Help Center */}
      {showHelpCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Help Center</h2>
              <button
                onClick={() => setShowHelpCenter(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <HelpCenter />
          </div>
        </div>
      )}
    </div>
  );
}
