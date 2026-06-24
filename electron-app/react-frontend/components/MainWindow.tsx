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
import electronService from "../services/electron";
import { StatsDashboard } from "./StatsDashboard";
import { SetupWizard } from "./SetupWizard";
import { useTeammates } from "../hooks/useTeammates";
import { TranslationToTeam } from "./TranslationToTeam";
import { SubtitleSettings } from "./SubtitleSettings";
import { GameDetectionBadge } from "./GameDetectionBadge";
import { HelpCenter } from "./HelpCenter";
import { peakAbs, boostQuietAudio, trimSilenceEdges, minTranscribeSeconds, extractLoudestWindow } from "../utils/audioMath";
import { isLikelyHallucination, normalizeMisheardCallout } from "../utils/transcriptionFilter";
import { EMPTY_COMMUNICATION_STATS } from "../utils/communicationStats";
import { isSameLanguagePassthroughTranslation, fixGamingTranslation } from "../utils/translationFiltering";
import { OutboundVoicePipeline } from "./OutboundVoicePipeline";
import { useMLModelLoading } from "../hooks/useMLModelLoading";
import { SUPPORTED_UI_LANGUAGES } from "../i18n/languages";

export function MainWindow() {
  const { mlReady, startupState } = useMLModelLoading();
  const { translate, targetLanguage, setTargetLanguage } = useTranslation();
  const { config, updateConfig, loading: configLoading } = useConfig();
  const { t, language, setLanguage } = useI18n();
  const [status, setStatus] = useState<string>(t(I18N_KEYS.STATUS_INITIALIZING));

  useEffect(() => {
    if (!mlReady) {
      setIsTranslationActive(false);
      if (startupState.phase === "ready") {
        setStatus(t("status.ready"));
      } else if (startupState.phase === "error") {
        setStatus(t("model_loading.error"));
      } else if (startupState.phase === "connecting") {
        setStatus(t("model_loading.connecting"));
      } else if (startupState.whisperLoaded && !startupState.translationLoaded) {
        setStatus(t("model_loading.loading_translation_models"));
      } else if (!startupState.whisperLoaded) {
        setStatus(t("model_loading.loading_speech_models"));
      } else {
        setStatus(t("model_loading.loading_models"));
      }
      return;
    }
    setIsTranslationActive(true);
    setStatus(t("status.ready"));
  }, [
    mlReady,
    startupState.phase,
    startupState.translationLoaded,
    startupState.whisperLoaded,
    t,
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslationActive, setIsTranslationActive] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const initialSetupPromptDone = useRef(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const { recordTranslation, startMatchSession, endMatchSession, activeSessionStats } =
    useMatchHistory();
  const {
    devices,
    selectedDevice,
    isCapturing,
    devicesLoading,
    captureLoading,
    error: audioError,
    errorSource: audioErrorSource,
    selectionOrigin,
    loadDevices,
    startCapture,
    stopCapture,
    selectDevice,
  } = useAudio(config?.audio?.device_index);
  const { teammates } = useTeammates();

  const handleSelectDevice = useCallback(
    async (deviceIndex: number) => {
      selectDevice(deviceIndex);
      if (!config || config.audio?.device_index === deviceIndex) {
        return;
      }
      await updateConfig({
        ...config,
        audio: { ...config.audio, device_index: deviceIndex },
      });
    },
    [config, selectDevice, updateConfig]
  );

  // Use refs to persist values across renders without causing re-renders
  const lastProcessTimeRef = useRef<number>(0);
  const pipelineStartRef = useRef<number>(0);
  const lastTimeoutCheckRef = useRef<number>(0);
  const timeoutResetInProgressRef = useRef<boolean>(false);
  const firstChunkLoggedRef = useRef<boolean>(false);
  const isProcessingRef = useRef(false);
  const isCapturingRef = useRef(false);
  const isTranslationActiveRef = useRef(false);
  const configRef = useRef(config);
  const teammatesRef = useRef(teammates);
  const targetLanguageRef = useRef(targetLanguage);
  const translateRef = useRef(translate);
  const recordTranslationRef = useRef(recordTranslation);
  const addLogRef = useRef<(message: string) => void>(() => {});
  const stopCaptureRef = useRef(stopCapture);

  // Add logging function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setStatusLogs((prev) => [...prev.slice(-49), logMessage]); // Keep last 50 logs
    setStatus(message); // Also update status
  }, []);

  isProcessingRef.current = isProcessing;
  isCapturingRef.current = isCapturing;
  isTranslationActiveRef.current = isTranslationActive;
  configRef.current = config;
  teammatesRef.current = teammates;
  targetLanguageRef.current = targetLanguage;
  translateRef.current = translate;
  recordTranslationRef.current = recordTranslation;
  addLogRef.current = addLog;
  stopCaptureRef.current = stopCapture;

  useEffect(() => {
    const lang = config?.translation?.target_language;
    if (lang && lang !== targetLanguage) {
      setTargetLanguage(lang);
    }
  }, [config?.translation?.target_language, targetLanguage, setTargetLanguage]);

  // Auto-show setup wizard once after config loads (not on every config save)
  useEffect(() => {
    if (configLoading || !config || initialSetupPromptDone.current) return;
    initialSetupPromptDone.current = true;
    if (!config.app?.setup_complete) {
      addLog("Setup wizard will be shown");
      setShowSetupWizard(true);
    } else {
      addLog("Setup complete, initializing...");
    }
  }, [config, configLoading, addLog]);

  // Log device selection changes
  useEffect(() => {
    if (selectedDevice !== null && devices.length > 0) {
      const device = devices.find((d: any) => d.index === selectedDevice);
      if (device) {
        addLog(`Device selected: ${device.name}`);
      }
    }
  }, [selectedDevice, devices, addLog]);

  // Log capture status changes
  useEffect(() => {
    if (isCapturing) {
      const device = devices.find((d: any) => d.index === selectedDevice);
      const deviceName = device ? device.name : `Device ${selectedDevice}`;
      addLog(`Audio capture started - ${deviceName}`);
      setStatus(`Capturing from ${deviceName} — waiting for audio...`);

      // If no audio chunks are received within 5s, show a clear message (avoids
      // "Capturing..." implying data is flowing when the pipeline isn't sending chunks yet)
      const noAudioTimeout = setTimeout(() => {
        if (!firstChunkLoggedRef.current) {
          setStatus(
            `Capturing from ${deviceName} — no audio received yet. Confirm this is your headphones/speakers and that game or system audio is playing.`
          );
        }
      }, 5000);
      return () => clearTimeout(noAudioTimeout);
    } else {
      addLog("Audio capture stopped");
      setStatus("Audio capture stopped");
      firstChunkLoggedRef.current = false;
      isProcessingRef.current = false;
      setIsProcessing(false);
      lastProcessTimeRef.current = 0;
    }
  }, [isCapturing, addLog, selectedDevice, devices]);

  useEffect(() => {
    if (isCapturing) {
      startMatchSession("General").catch((err) =>
        console.warn("Failed to start match session", err)
      );
      return;
    }

    endMatchSession().catch((err) =>
      console.warn("Failed to end match session", err)
    );
  }, [isCapturing, startMatchSession, endMatchSession]);

  useEffect(() => {
    return () => {
      endMatchSession().catch((err) =>
        console.warn("Failed to end match session", err)
      );
    };
  }, [endMatchSession]);

  useEffect(() => {
    if (!isCapturing) {
      return;
    }

    let audioChunkCount = 0;
    let lastLogTime = Date.now();
    let lowAudioCount = 0;
    let lastAudioLevelLog = Date.now();

    // Audio buffering for better transcription
    let audioBuffer: number[][] = [];
    let bufferStartTime = Date.now();
    const MIN_TRANSCRIBE_SECONDS =
      configRef.current?.whisper?.min_buffer_duration ?? 0.85;
    const MIN_BUFFER_DURATION_MS = Math.round(MIN_TRANSCRIBE_SECONDS * 1000);
    const MIN_PROCESS_INTERVAL_MS = Math.round(
      (configRef.current?.whisper?.min_transcription_interval ?? 1.0) * 1000
    );
    const MAX_BUFFER_SECONDS = Math.max(MIN_TRANSCRIBE_SECONDS + 0.9, 2.2);
    const SPEECH_HANGOVER_MS = 3500;
    const SILENCE_TAIL_MS = 1200;
    let lastBufferLogTime = Date.now();
    let lastSpeechTime = 0;
    let bufferPeak = 0;

    const bufferPeakAbs = (buf: number[][]) => {
      let peak = 0;
      for (const chunk of buf) {
        const p = peakAbs(chunk);
        if (p > peak) peak = p;
      }
      return peak;
    };

    const minBufferMs = (peak: number, rms: number) =>
      minTranscribeSeconds(peak, rms) * 1000;

    const trimBuffer = (sampleRate: number) => {
      const maxSamples = Math.floor(sampleRate * MAX_BUFFER_SECONDS);
      let total = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
      while (total > maxSamples && audioBuffer.length > 0) {
        const removed = audioBuffer.shift();
        if (removed) total -= removed.length;
      }
    };

    // Listen to audio chunks
    const unlisten = electronService.listenToAudioChunk(async (event) => {
      if (!isCapturingRef.current) {
        return;
      }

      audioChunkCount++;
      const now = Date.now();
      const addLog = addLogRef.current;

      // Log first audio chunk received (only once per session)
      if (audioChunkCount === 1 && !firstChunkLoggedRef.current) {
        firstChunkLoggedRef.current = true;
        addLog("[OK] First audio chunk received - capture is working!");
      }

      // Log audio chunk details every 50 chunks
      if (audioChunkCount % 50 === 0 && audioChunkCount > 0) {
        const rms = Math.sqrt(
          event.data.reduce((sum: number, val: number) => sum + val * val, 0) /
            event.data.length
        );
        const peak = peakAbs(event.data);
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
          const dev = devices.find((d) => d.index === selectedDevice);
          const loopbackHint =
            dev && !dev.is_loopback && dev.channels <= 1
              ? " Pick a [Loopback] device (2ch) in Audio Settings."
              : "";
          const statusMsg = `Receiving audio but it's very quiet (${audioChunkCount} chunks). Check: 1) [Loopback] headphones/speakers selected, 2) Game audio is playing, 3) Windows volume is up.${loopbackHint}`;
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
      if (!isTranslationActiveRef.current) {
        audioBuffer = []; // Clear buffer when translation is inactive
        return;
      }

      // Check if audio data is meaningful (not just silence)
      const chunkSamples = boostQuietAudio(new Float32Array(event.data));
      const audioLevel = Math.sqrt(
        chunkSamples.reduce((sum: number, val: number) => sum + val * val, 0) /
          chunkSamples.length
      );

      // Also check peak level (max absolute value) for better detection
      const peakLevel = peakAbs(chunkSamples);

      // Keep buffering the newest audio even while a request is in flight.
      // If a request stalls, reset the state and let the latest buffered audio win.
      if (isProcessingRef.current && !timeoutResetInProgressRef.current) {
        const timeSinceStart =
          lastProcessTimeRef.current === 0
            ? Infinity
            : now - lastProcessTimeRef.current;

        if (
          lastTimeoutCheckRef.current === 0 ||
          now - lastTimeoutCheckRef.current >= 5000
        ) {
          lastTimeoutCheckRef.current = now;

          if (!isFinite(timeSinceStart) || timeSinceStart < 0 || timeSinceStart > 120000) {
            console.warn("Processing timeout detected, resetting pipeline state", {
              timeSinceStart,
              lastProcessTime: lastProcessTimeRef.current,
              now,
            });
            timeoutResetInProgressRef.current = true;
            addLog("⚠ Processing timeout - resetting state");
            isProcessingRef.current = false;
            setIsProcessing(false);
            lastProcessTimeRef.current = 0;
            setTimeout(() => {
              timeoutResetInProgressRef.current = false;
            }, 1000);
          }
        }
      }

      // Log audio levels periodically for debugging
      if (now - lastAudioLevelLog > 2000) {
        console.log(
          "Audio levels:",
          `RMS=${audioLevel.toFixed(6)}, peak=${peakLevel.toFixed(6)}`,
          "buffer chunks:",
          audioBuffer.length
        );
        lastAudioLevelLog = now;
      }

      // Use both RMS and peak level for detection
      const isCompletelySilent = audioLevel === 0 && peakLevel === 0;
      const isNearSilent = audioLevel < 0.000002 && peakLevel < 0.000004;
      const hasSpeech = !isCompletelySilent && !isNearSilent;
      const inSpeechHangover =
        lastSpeechTime > 0 && now - lastSpeechTime < SPEECH_HANGOVER_MS;

      if (hasSpeech) {
        lastSpeechTime = now;
        bufferPeak = Math.max(bufferPeak, peakLevel);
        lowAudioCount = 0;
      } else {
        lowAudioCount++;
        if (lowAudioCount % 1000 === 0 && isCompletelySilent) {
          addLog(
            "⚠ Audio is completely silent (RMS=0). Select your headphones/speakers in Audio Settings and play game or system audio."
          );
        }
      }

      // Keep buffering through short gaps inside a callout (loopback is often sparse).
      const shouldBufferChunk = hasSpeech || inSpeechHangover;
      if (!shouldBufferChunk) {
        if (audioBuffer.length > 0 && now - lastSpeechTime > SPEECH_HANGOVER_MS) {
          audioBuffer = [];
          bufferPeak = 0;
        }
        return;
      }

      audioBuffer.push(Array.from(chunkSamples));
      trimBuffer(event.sample_rate);
      if (audioBuffer.length === 1) {
        bufferStartTime = now;
      }

      bufferPeak = Math.max(bufferPeak, bufferPeakAbs(audioBuffer));

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
      const minAudioMs = minBufferMs(bufferPeak, Math.max(audioLevel, bufferPeak * 0.2));
      const silenceAfterSpeech =
        !hasSpeech &&
        inSpeechHangover &&
        now - lastSpeechTime >= SILENCE_TAIL_MS &&
        actualAudioDurationMs >= 650;
      const shouldProcess =
        (actualAudioDurationMs >= minAudioMs &&
          timeSinceLastProcess >= MIN_PROCESS_INTERVAL_MS) ||
        (silenceAfterSpeech &&
          actualAudioDurationMs >= 300 &&
          bufferPeak >= 0.05) ||
        actualAudioDurationMs >= MAX_BUFFER_SECONDS * 1000;

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

      if (
        actualAudioDurationMs >= MAX_BUFFER_SECONDS * 1000 &&
        !isProcessingRef.current
      ) {
        addLog(
          `⚠ Buffer at ${(actualAudioDurationMs / 1000).toFixed(1)}s, processing latest audio`
        );
      }

      // Reset buffer start time if buffer was cleared (prevents stale timestamps)
      if (audioBuffer.length === 0) {
        bufferStartTime = now;
      }

      // Only process if not already processing AND enough time has passed since last process
      // (timeSinceLastProcess is already declared above, reuse it)
      const canProcess =
        !isProcessingRef.current &&
        timeSinceLastProcess >= MIN_PROCESS_INTERVAL_MS;

      if (shouldProcess && audioBuffer.length > 0 && canProcess) {
        // Recalculate actual audio duration before processing
        const processingTotalSamples = audioBuffer.reduce(
          (sum, chunk) => sum + chunk.length,
          0
        );
        const processingAudioDurationMs =
          (processingTotalSamples / event.sample_rate) * 1000;

        const minProcessMs = minBufferMs(bufferPeak, bufferPeak * 0.2);
        if (processingAudioDurationMs < minProcessMs) {
          console.log(
            `[DEBUG] Skipping processing: only ${processingAudioDurationMs.toFixed(
              0
            )}ms, need ${minProcessMs}ms`
          );
          return;
        }

        // Set processing flag IMMEDIATELY to prevent concurrent requests
        isProcessingRef.current = true;
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
        let combinedAudio = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of audioBuffer) {
          combinedAudio.set(new Float32Array(chunk), offset);
          offset += chunk.length;
        }
        combinedAudio = boostQuietAudio(combinedAudio);
        combinedAudio = trimSilenceEdges(combinedAudio, event.sample_rate);
        const bufferedSeconds = combinedAudio.length / event.sample_rate;
        if (bufferedSeconds > 1.2) {
          combinedAudio = extractLoudestWindow(combinedAudio, event.sample_rate, 1.2);
        }

        const maxSamples = Math.floor(event.sample_rate * MAX_BUFFER_SECONDS);
        if (combinedAudio.length > maxSamples) {
          combinedAudio = combinedAudio.slice(-maxSamples);
        }

        pipelineStartRef.current = now;

        const finishProcessing = () => {
          isProcessingRef.current = false;
          setIsProcessing(false);
        };

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
            combinedAudio.reduce((sum: number, val: number) => sum + val * val, 0) /
              combinedAudio.length
          );
          const peakLevel = peakAbs(combinedAudio);

          // Skip transcription if audio is completely silent
          if (avgLevel === 0 && peakLevel === 0) {
            const skipMsg =
              "Skipping transcription: audio is completely silent (RMS=0)";
            console.log(skipMsg);
            addLog(skipMsg);
            setStatus("Audio is silent - check Windows audio routing");
            audioBuffer = [];
            bufferPeak = 0;
            finishProcessing();
            return;
          }

          if (avgLevel < 0.004 && peakLevel < 0.035) {
            addLog(
              `Skipping mostly-silent buffer (RMS=${avgLevel.toFixed(
                6
              )}, peak=${peakLevel.toFixed(6)})`
            );
            setStatus("No speech in buffer — play callout louder or check routing");
            audioBuffer = [];
            bufferPeak = 0;
            finishProcessing();
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
            finishProcessing();
            return;
          }

          // Check for invalid values
          const hasInvalid = combinedAudio.some((val) => !isFinite(val));
          if (hasInvalid) {
            console.error(
              "Cannot transcribe: audio contains invalid values (NaN/Inf)"
            );
            setStatus("Error: Invalid audio data");
            finishProcessing();
            return;
          }

          const minDurationSec = minTranscribeSeconds(peakLevel, avgLevel);
          const minSamples = Math.floor(event.sample_rate * minDurationSec);
          if (combinedAudio.length < minSamples) {
            const shortMsg = `Audio too short (${(
              combinedAudio.length / event.sample_rate
            ).toFixed(2)}s, need ${minDurationSec.toFixed(2)}s) — waiting for more speech`;
            console.warn(shortMsg);
            addLog(shortMsg);
            setStatus("Buffering more audio...");
            finishProcessing();
            return;
          }

          // Committed to transcribe — clear live buffer
          audioBuffer = [];
          bufferPeak = 0;
          lastProcessTimeRef.current = now;

          const transcribeLog = `Transcribing: ${
            combinedAudio.length
          } samples, ${(combinedAudio.length / event.sample_rate).toFixed(
            2
          )}s, RMS=${avgLevel.toFixed(6)}`;

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
            const shouldAutoDetectSource =
              configRef.current?.translation?.auto_detect ?? true;
            const clipSeconds = combinedAudio.length / event.sample_rate;
            const whisperLanguage = shouldAutoDetectSource
              ? clipSeconds <= 1.25
                ? "es"
                : undefined
              : configRef.current?.whisper?.language || undefined;

            const transcriptionPromise = electronService.transcribeAudio(
              combinedAudio,
              event.sample_rate,
              {
                channels: 1,
                language: whisperLanguage || undefined,
                modelName: configRef.current?.whisper?.model || "base",
              }
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
            const emptyLog = `⚠ No caption (instrumental section, filtered phrase, or vocals too quiet in mix). RMS=${
              transcription?.rms_level || 0
            }`;
            console.warn(emptyLog);
            addLog(emptyLog);
            setStatus("Transcription: No speech detected");
            isProcessingRef.current = false;
            setIsProcessing(false);
            return; // Exit early if no text
          }

          if (isLikelyHallucination(transcription.text)) {
            addLog(
              `⚠ Skipped likely Whisper hallucination: "${transcription.text.trim()}"`
            );
            setStatus("Skipped noise / hallucination");
            return;
          }

          const normalizedText = normalizeMisheardCallout(transcription.text);
          if (normalizedText !== transcription.text.trim()) {
            addLog(
              `[OK] Normalized callout: "${transcription.text.trim()}" → "${normalizedText}"`
            );
            transcription = { ...transcription, text: normalizedText };
          }

          if (
            transcription &&
            transcription.text &&
            transcription.text.trim().length > 0
          ) {
            const transcribeSuccess = `[OK] Transcription: "${transcription.text}" (${transcription.language})`;
            console.log("[OK] Transcription successful:", transcription.text);
            addLog(transcribeSuccess);
            setStatus(`Transcribed: ${transcription.text}`);

            // Auto-detect teammate language from transcription
            // This automatically creates/updates teammates based on detected languages
            try {
              const detectedTeammate = await electronService.autoDetectTeammateLanguage(
                transcription.language,
                undefined // Auto-generate teammate name based on language
              );
              console.log(
                `Auto-detected language ${transcription.language} for teammate: ${detectedTeammate}`
              );
              addLog(
                `[OK] Auto-detected teammate: ${detectedTeammate} (${transcription.language})`
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
                targetLanguage: targetLanguageRef.current,
              });
              translation = await translateRef.current(
                transcription.text,
                transcription.language
              );

              console.log("=== TRANSLATION RESULT ===", translation);
              if (translation?.translated) {
                const fixed = fixGamingTranslation(
                  transcription.text,
                  translation.translated,
                  translation.targetLanguage ?? targetLanguageRef.current
                );
                if (fixed !== translation.translated) {
                  addLog(
                    `[OK] Fixed callout translation: "${translation.translated}" → "${fixed}"`
                  );
                  translation = { ...translation, translated: fixed };
                }
              }
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
              addLog(`[OK] Translation failed: ${errorMsg}`);
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
              const isSameLanguagePassthrough =
                isSameLanguagePassthroughTranslation({
                  original: transcription.text,
                  translated: translation.translated,
                  sourceLanguage: translation.sourceLanguage,
                  targetLanguage: translation.targetLanguage,
                });
              const translateLog = `[OK] Translation: "${transcription.text}" -> "${translation.translated}" (${translation.sourceLanguage}->${translation.targetLanguage})`;
              console.log("=== TRANSLATION SUCCESS ===", {
                original: transcription.text,
                translated: translation.translated,
                source: translation.sourceLanguage,
                target: translation.targetLanguage,
                fullTranslation: translation,
              });
              if (!isSameLanguagePassthrough) {
                addLog(translateLog);
                setStatus(`Translated: ${translation.translated}`);
              }

              // Show on overlay - always show if overlay is enabled
              const overlayEnabled = configRef.current?.overlay?.enabled ?? true;
              const showSameLanguage =
                configRef.current?.overlay?.show_same_language ?? false;
              const languagesMatch =
                translation.sourceLanguage === translation.targetLanguage;
              const shouldShowOverlay =
                overlayEnabled && (showSameLanguage || !languagesMatch);
              addLog(
                `[DEBUG] Overlay check: enabled=${overlayEnabled}, shouldShow=${shouldShowOverlay}, config=${JSON.stringify(
                  configRef.current?.overlay
                )}`
              );

              // Translate to team language if enabled
              const translateToTeammates =
                configRef.current?.translation?.translate_to_teammates ?? false;
              const useAutoDetect =
                configRef.current?.translation?.use_auto_detect_team_language ?? false;
              const manualTeamTargetLanguage =
                configRef.current?.translation?.team_target_language || "en";

              // Calculate most common language from teammates if auto-detect is enabled
              let effectiveTeamLanguage = manualTeamTargetLanguage;
              if (useAutoDetect && teammatesRef.current.length > 0) {
                const languageCounts: Record<string, number> = {};
                teammatesRef.current.forEach((t) => {
                  if (t.primary_language) {
                    languageCounts[t.primary_language] =
                      (languageCounts[t.primary_language] || 0) + 1;
                  }
                  Object.entries(t.detected_languages || {}).forEach(
                    ([lang, count]) => {
                      languageCounts[lang] =
                        (languageCounts[lang] || 0) + (count as unknown as number);
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

              if (shouldShowOverlay) {
                try {
                  const overlayLog = `Showing overlay: "${translation.translated}"`;
                  console.log("=== SHOWING OVERLAY ===", {
                    text: translation.translated,
                    overlayEnabled,
                    sourceLang: translation.sourceLanguage,
                    targetLang: translation.targetLanguage,
                    showSameLanguage: configRef.current?.overlay?.show_same_language,
                  });
                  addLog(overlayLog);

                  addLog(
                    `[DEBUG] Calling show_overlay_text with: "${translation.translated}"`
                  );

                  addLog(`[DEBUG] About to invoke show_overlay_text...`);
                  const result = await electronService.showOverlayText(
                    translation.translated,
                    configRef.current?.overlay as Record<string, unknown> | undefined
                  );
                  console.log("[OK] Overlay command succeeded:", result);
                  addLog(
                    `[OK] Overlay displayed successfully. Result: ${JSON.stringify(
                      result
                    )}`
                  );
                  addLog(`[DEBUG] Overlay invoke completed without error`);
                } catch (error) {
                  const errorMsg = `[OK] Failed to show overlay: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`;
                  console.error("[OK] Failed to show overlay:", error);
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
                console.log("[OK] Overlay not shown - reasons:", {
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

              void (async () => {
                console.log("=== RECORDING TRANSLATION ===", {
                  original: transcription.text,
                  translated: translation.translated,
                  source_lang: transcription.language,
                  target_lang: translation.targetLanguage || "",
                });
                try {
                  await recordTranslationRef.current({
                    original: transcription.text,
                    translated: translation.translated,
                    source_lang: transcription.language,
                    target_lang: translation.targetLanguage || "",
                    processing_ms:
                      pipelineStartRef.current > 0
                        ? Date.now() - pipelineStartRef.current
                        : undefined,
                  });
                  console.log("[OK] Translation recorded in history successfully");
                } catch (error) {
                  console.error("Failed to record translation:", error);
                  addLog(
                    `⚠ Failed to record translation: ${
                      error instanceof Error ? error.message : String(error)
                    }`
                  );
                }
              })();

              if (
                translateToTeammates &&
                effectiveTeamLanguage !== translation.targetLanguage &&
                effectiveTeamLanguage !== translation.sourceLanguage
              ) {
                void (async () => {
                  try {
                    const teamTranslation = await translateRef.current(
                      transcription.text,
                      translation.sourceLanguage,
                      effectiveTeamLanguage
                    );
                    if (!teamTranslation?.translated?.trim()) {
                      return;
                    }

                    addLog(
                      `-> Team (${effectiveTeamLanguage}${
                        useAutoDetect ? " [auto]" : ""
                      }): "${teamTranslation.translated}"`
                    );

                    if (shouldShowOverlay) {
                      await electronService.showOverlayText(
                        `${translation.translated}\nTeam: ${teamTranslation.translated}`,
                        configRef.current?.overlay as
                          | Record<string, unknown>
                          | undefined
                      );
                    }
                  } catch (err) {
                    console.warn(
                      `Failed to translate to team language (${effectiveTeamLanguage}):`,
                      err
                    );
                  }
                })();
              }
            }
          } else {
            const noSpeechLog = `[OK] No speech detected (RMS=${avgLevel.toFixed(
              6
            )})`;
            console.log(
              "[OK] No text in transcription - empty or whitespace only. Transcription object:",
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

          const errorLog = `[OK] Error: ${errorMessage}`;
          addLog(errorLog);
          setStatus(`Error: ${errorMessage}`);
        } finally {
          finishProcessing();
          lastProcessTimeRef.current = Date.now();
        }
      }
    });

    return () => {
      console.log("Cleaning up audio listener...");
      try {
        unlisten();
        console.log("Audio listener cleaned up");
      } catch (err) {
        console.error("Error cleaning up audio listener:", err);
      }
    };
  }, [
    isCapturing,
    selectedDevice,
    devices,
    config?.whisper?.min_buffer_duration,
    config?.whisper?.min_transcription_interval,
  ]);

  // Cleanup only when the window/component is destroyed (not when isCapturing toggles)
  useEffect(() => {
    return () => {
      console.log("MainWindow unmounting, performing cleanup...");
      void (async () => {
        try {
          if (isCapturingRef.current) {
            await stopCaptureRef.current();
          }
          await endMatchSession();
          console.log("Cleanup complete");
        } catch (err) {
          console.error("Error during cleanup:", err);
        }
      })();
    };
  }, [endMatchSession]);

  // Show loading state if config is still loading (AFTER all hooks are called)
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">{t("app.loading_configuration_title")}</h2>
          <p className="text-gray-400">
            {t("app.loading_configuration_message")}
          </p>
          <p className="text-gray-500 text-sm mt-4">
            {t("app.loading_configuration_hint")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        minHeight: '100vh',
        color: '#ffffff'
      }}
    >
      <div className="max-w-7xl mx-auto p-6 pt-8">
        <header className="mb-8">
          <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="relative z-10 min-w-0 shrink-0">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-blue-400">
                {t(I18N_KEYS.MAIN_TITLE)}
              </h1>
              <p className="text-gray-300 text-lg">
                {t(I18N_KEYS.MAIN_SUBTITLE)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center lg:justify-end lg:max-w-[55%]">
              <button
                onClick={() => setShowHelpCenter(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title={t("main.help_center_title")}
              >
                {t("main.help_center")}
              </button>
              <button
                onClick={() => setShowSetupWizard(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title={t("main.setup_wizard_title")}
              >
                {t(I18N_KEYS.MAIN_SETUP_WIZARD)}
              </button>
              <button
                onClick={async () => {
                  try {
                    const testText = t("main.test_overlay_text");
                    addLog("Testing Python subtitle overlay with sample text...");
                    console.log("=== TEST OVERLAY BUTTON CLICKED (PYTHON) ===");

                    // Use the exact same overlay path as real subtitles
                    const result = await electronService.showOverlayText(
                      testText,
                      configRef.current?.overlay as Record<string, unknown> | undefined
                    );
                    console.log("Python overlay result:", result);

                    addLog(`Overlay test result: ${JSON.stringify(result)}`);
                  } catch (err) {
                    console.error("Test overlay error:", err);
                    const errorMsg =
                      err instanceof Error
                        ? err.message
                        : String(err) || "Unknown error";
                    addLog(`[OK] Test overlay failed: ${errorMsg}`);

                    // Show error details in console for debugging
                    console.error("Full error object:", err);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title={t("main.test_overlay_title")}
              >
                {t(I18N_KEYS.MAIN_TEST_OVERLAY)}
              </button>
            </div>
          </div>
          <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {t(I18N_KEYS.MAIN_STATUS)}: <span className="text-blue-400">{status}</span>
                </span>
                {!isTranslationActive && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                    {t("status.translation_paused")}
                  </span>
                )}
                <GameDetectionBadge />
              </div>
              <div className="flex gap-2">
                {isCapturing && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium border border-green-500/30">
                    {t("status.capture_active")}
                  </span>
                )}
                {!isCapturing && (
                  <span className="px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg text-sm font-medium border border-gray-600/30">
                    {t("status.capture_inactive")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AudioSettings
              devices={devices}
              selectedDevice={selectedDevice}
              isCapturing={isCapturing}
              devicesLoading={devicesLoading}
              captureLoading={captureLoading}
              error={audioError}
              errorSource={audioErrorSource}
              selectionOrigin={selectionOrigin}
              selectDevice={handleSelectDevice}
              loadDevices={loadDevices}
              startCapture={startCapture}
              stopCapture={stopCapture}
            />
            <TranslationSettings />
            <SubtitleSettings />
            <TranslationToTeam />
          </div>
          <div className="space-y-6">
            <TranslationLog />
            {/* Status Logs Panel */}
            <div className="p-5 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-white">
                {t("main.status_logs")}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs border border-gray-600">
                {statusLogs.length === 0 ? (
                  <p className="text-gray-500">{t("main.no_logs")}</p>
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
                className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t("main.clear_logs")}
              </button>
            </div>
            <StatsDashboard
              statsOverride={
                isCapturing ? activeSessionStats : EMPTY_COMMUNICATION_STATS
              }
              onRefreshOverride={isCapturing ? undefined : null}
            />
          </div>
        </div>
      </div>

      <OutboundVoicePipeline
        config={config}
        isLoopbackCapturing={isCapturing}
        isTranslationActive={isTranslationActive}
        teammates={teammates}
        onLog={addLog}
        translate={translate}
      />

      {/* Setup Wizard */}
      {showSetupWizard && (
        <SetupWizard
          onComplete={() => {
            setShowSetupWizard(false);
            setStatus(t("setup_wizard.complete_status"));
          }}
          onClose={() => setShowSetupWizard(false)}
          onStartCapture={async () => {
            const deviceIndex =
              config?.audio?.device_index ?? selectedDevice ?? undefined;
            if (deviceIndex == null) {
              throw new Error(t("audio.select_device_first"));
            }
            await startCapture(deviceIndex);
          }}
        />
      )}

      {/* Help Center */}
      {showHelpCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {t("help_center.title")}
              </h2>
              <button
                type="button"
                onClick={() => setShowHelpCenter(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
                aria-label={t("common.close")}
              >
                X
              </button>
            </div>
            <HelpCenter />
          </div>
        </div>
      )}

      {/* UI Language Selector - bottom-right aligned with cards */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2 shadow-lg flex items-center space-x-2 text-sm">
          <span className="text-gray-300">
            {t(I18N_KEYS.TRANSLATION_UI_LANGUAGE)}
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-900 text-white text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SUPPORTED_UI_LANGUAGES.map((uiLanguage) => (
              <option key={uiLanguage.code} value={uiLanguage.code}>
                {t(uiLanguage.labelKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

