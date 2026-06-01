import { useEffect, useRef, useCallback, useState } from "react";
import electronService, {
  type Config,
  type VoiceOutputMode,
} from "../services/electron";
import { peakAbs } from "../utils/audioMath";
import { isLikelyHallucination } from "../utils/transcriptionFilter";

export interface OutboundVoicePipelineProps {
  config: Config | null;
  isLoopbackCapturing: boolean;
  isTranslationActive: boolean;
  teammates: Array<{
    primary_language?: string;
    detected_languages?: Record<string, number>;
  }>;
  onLog: (message: string) => void;
  translate: (
    text: string,
    sourceLanguage?: string,
    targetLanguage?: string
  ) => Promise<
    | {
        translated: string;
        sourceLanguage: string;
        targetLanguage: string;
      }
    | undefined
  >;
}

/**
 * Captures the user's microphone, transcribes speech, translates to the team
 * language, and plays TTS to a virtual cable / speakers for in-game voice chat.
 */
export function OutboundVoicePipeline({
  config,
  isLoopbackCapturing,
  isTranslationActive,
  teammates,
  onLog,
  translate,
}: OutboundVoicePipelineProps) {
  const onLogRef = useRef(onLog);
  const translateRef = useRef(translate);
  const configRef = useRef(config);
  const teammatesRef = useRef(teammates);
  const isProcessingRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const lastSpokenTextRef = useRef("");
  const [isMicCapturing, setIsMicCapturing] = useState(false);

  onLogRef.current = onLog;
  translateRef.current = translate;
  configRef.current = config;
  teammatesRef.current = teammates;

  const voiceEnabled =
    !!config?.translation?.translate_to_teammates &&
    (config?.translation?.tts_for_team_translations ||
      config?.tts?.enabled ||
      config?.translation?.enable_tts) &&
    config?.audio?.microphone_device_index != null;

  const resolveTeamLanguage = useCallback((): string => {
    const cfg = configRef.current;
    if (!cfg) return "en";
    const useAutoDetect =
      cfg.translation?.use_auto_detect_team_language ?? false;
    if (!useAutoDetect) {
      return cfg.translation?.team_target_language || "en";
    }
    const languageCounts: Record<string, number> = {};
    teammatesRef.current.forEach((t) => {
      if (t.primary_language) {
        languageCounts[t.primary_language] =
          (languageCounts[t.primary_language] || 0) + 1;
      }
      Object.entries(t.detected_languages || {}).forEach(([lang, count]) => {
        languageCounts[lang] = (languageCounts[lang] || 0) + (count as number);
      });
    });
    let maxCount = 0;
    let mostCommon = cfg.translation?.team_target_language || "en";
    Object.entries(languageCounts).forEach(([lang, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = lang;
      }
    });
    return mostCommon;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const micIndex = config?.audio?.microphone_device_index;

    if (!voiceEnabled || !isLoopbackCapturing || micIndex == null) {
      electronService.stopAudioCapture("mic").catch(() => undefined);
      setIsMicCapturing(false);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        await electronService.startAudioCapture(micIndex, "mic");
        if (cancelled) {
          await electronService.stopAudioCapture("mic");
          return;
        }
        setIsMicCapturing(true);
        onLogRef.current(
          `[Voice Out] Mic capture started (device ${micIndex})`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onLogRef.current(`[Voice Out] Failed to start mic capture: ${msg}`);
        setIsMicCapturing(false);
      }
    })();

    return () => {
      cancelled = true;
      electronService.stopAudioCapture("mic").catch(() => undefined);
      setIsMicCapturing(false);
    };
  }, [voiceEnabled, isLoopbackCapturing, config?.audio?.microphone_device_index]);

  useEffect(() => {
    if (!isMicCapturing || !isTranslationActive || !voiceEnabled) {
      return;
    }

    const MIN_BUFFER_DURATION_MS = Math.round(
      (configRef.current?.whisper?.min_buffer_duration ?? 1.2) * 1000
    );
    const MIN_PROCESS_INTERVAL_MS = Math.round(
      (configRef.current?.whisper?.min_transcription_interval ?? 1.5) * 1000
    );
    const MAX_BUFFER_SECONDS = Math.max(
      (configRef.current?.whisper?.min_buffer_duration ?? 1.2) + 0.8,
      2.4
    );
    const AUDIO_THRESHOLD = 0.002;

    let audioBuffer: number[][] = [];

    const trimBuffer = (sampleRate: number) => {
      const maxSamples = Math.floor(sampleRate * MAX_BUFFER_SECONDS);
      let total = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
      while (total > maxSamples && audioBuffer.length > 0) {
        const removed = audioBuffer.shift();
        if (removed) total -= removed.length;
      }
    };

    const unlisten = electronService.listenToAudioChunk(async (event) => {
      if (isProcessingRef.current) return;

      const rms = Math.sqrt(
        event.data.reduce((sum, val) => sum + val * val, 0) / event.data.length
      );
      if (rms < AUDIO_THRESHOLD) return;

      audioBuffer.push(event.data);
      trimBuffer(event.sample_rate);

      const now = Date.now();
      const totalSamples = audioBuffer.reduce((sum, c) => sum + c.length, 0);
      const bufferDurationMs = (totalSamples / event.sample_rate) * 1000;
      const timeSinceLastProcess = now - lastProcessTimeRef.current;

      if (
        bufferDurationMs < MIN_BUFFER_DURATION_MS ||
        timeSinceLastProcess < MIN_PROCESS_INTERVAL_MS
      ) {
        return;
      }

      isProcessingRef.current = true;
      lastProcessTimeRef.current = now;

      const totalLength = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
      let combinedAudio = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioBuffer) {
        combinedAudio.set(new Float32Array(chunk), offset);
        offset += chunk.length;
      }
      audioBuffer = [];

      const avgLevel = Math.sqrt(
        combinedAudio.reduce((sum, val) => sum + val * val, 0) /
          combinedAudio.length
      );
      const peakLevel = peakAbs(combinedAudio);

      if (avgLevel === 0 && peakLevel === 0) {
        isProcessingRef.current = false;
        return;
      }

      try {
        onLogRef.current(
          `[Voice Out] Processing ${combinedAudio.length} samples (RMS=${avgLevel.toFixed(4)})`
        );

        const whisperModel = configRef.current?.whisper?.model || "base";
        const shouldAutoDetectSource =
          configRef.current?.translation?.auto_detect ?? true;
        const transcription = await electronService.transcribeAudio(
          combinedAudio,
          event.sample_rate,
          {
            modelName: whisperModel,
            channels: 1,
            language: shouldAutoDetectSource
              ? undefined
              : configRef.current?.whisper?.language || undefined,
          }
        );

        const text = (transcription.text || "").trim();
        if (!text || isLikelyHallucination(text)) {
          return;
        }

        const teamLanguage = resolveTeamLanguage();
        const sourceLanguage = transcription.language || "auto";

        if (
          sourceLanguage !== "unknown" &&
          sourceLanguage === teamLanguage
        ) {
          onLogRef.current(
            `[Voice Out] Skipping TTS — already in team language (${teamLanguage})`
          );
          return;
        }

        const translation = await translateRef.current(
          text,
          sourceLanguage,
          teamLanguage
        );
        if (!translation?.translated?.trim()) {
          return;
        }

        const spoken = translation.translated.trim();
        if (spoken === lastSpokenTextRef.current) {
          return;
        }
        lastSpokenTextRef.current = spoken;

        const cfg = configRef.current;
        const outputMode: VoiceOutputMode =
          cfg?.voice_output?.mode || "virtual_mic";
        const outputDeviceIndex = cfg?.audio?.tts_output_device_index ?? null;

        if (outputMode !== "speakers" && outputDeviceIndex == null) {
          onLogRef.current(
            "[Voice Out] No TTS output device — select VB-Audio CABLE Input in Translation to Team"
          );
          return;
        }

        onLogRef.current(
          `[Voice Out] TTS: "${text}" -> "${spoken}" (${teamLanguage})`
        );

        await electronService.speakText(spoken, {
          language: teamLanguage,
          outputDeviceIndex,
          outputMode,
          volume: cfg?.tts?.volume ?? 1.0,
          rate: cfg?.tts?.rate ?? 1.0,
        });

        onLogRef.current(`[Voice Out] Spoke translation via ${outputMode}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onLogRef.current(`[Voice Out] Error: ${msg}`);
      } finally {
        isProcessingRef.current = false;
      }
    }, "mic");

    return () => {
      unlisten();
      audioBuffer = [];
    };
  }, [
    isMicCapturing,
    isTranslationActive,
    voiceEnabled,
    resolveTeamLanguage,
  ]);

  return null;
}
