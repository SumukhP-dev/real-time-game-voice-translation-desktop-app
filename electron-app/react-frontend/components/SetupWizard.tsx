import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConfig } from "../hooks/useConfig";
import electronService, {
  type AudioDevice,
  type PlaybackDevice,
} from "../services/electron";
import {
  filterDevicesByCaptureSource,
  findPreferredCaptureDevice,
  findPreferredMicrophoneDevice,
  findPreferredVirtualCableDevice,
  hasVirtualCablePlaybackDevice,
} from "../utils/audioDevices";
import { VbAudioCableInstallPanel } from "./VbAudioCableInstallPanel";
import { useI18n } from "../hooks/useI18n";
import { TRANSLATION_LANGUAGE_OPTIONS } from "../i18n/languages";

type SetupStepId =
  | "welcome"
  | "loopback"
  | "microphone"
  | "translation"
  | "virtual_cable"
  | "complete";

type VoiceOutIntent = "subtitles" | "voice";

interface SetupWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
  onStartCapture?: () => Promise<void>;
}

export function SetupWizard({
  onComplete,
  onClose,
  onStartCapture,
}: SetupWizardProps) {
  const { t } = useI18n();
  const { config, updateConfig } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [startingCapture, setStartingCapture] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [playbackDevices, setPlaybackDevices] = useState<PlaybackDevice[]>([]);
  const [voiceOutIntent, setVoiceOutIntent] = useState<VoiceOutIntent | null>(
    null
  );

  const platform = electronService.getPlatform();
  const isWindows = platform === "win32";
  const autoSelectDone = useRef(false);

  const loopbackDevices = filterDevicesByCaptureSource(audioDevices, "loopback");
  const microphoneDevices = filterDevicesByCaptureSource(
    audioDevices,
    "microphone"
  );

  const loadAudioDevices = async () => {
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const devices = await electronService.getAudioDevices();
      setAudioDevices(devices);

      if (!autoSelectDone.current && config) {
        autoSelectDone.current = true;
        const loopbackFiltered = filterDevicesByCaptureSource(devices, "loopback");
        const micFiltered = filterDevicesByCaptureSource(devices, "microphone");

        let deviceIndex = config.audio?.device_index ?? null;
        if (
          deviceIndex == null ||
          !loopbackFiltered.some((d) => d.index === deviceIndex)
        ) {
          deviceIndex =
            findPreferredCaptureDevice(loopbackFiltered)?.index ??
            loopbackFiltered[0]?.index ??
            null;
        }

        let micIndex = config.audio?.microphone_device_index ?? null;
        if (
          micIndex == null ||
          !micFiltered.some((d) => d.index === micIndex)
        ) {
          micIndex =
            findPreferredMicrophoneDevice(micFiltered)?.index ??
            micFiltered[0]?.index ??
            null;
        }

        if (deviceIndex !== config.audio?.device_index || micIndex !== config.audio?.microphone_device_index) {
          await updateConfig({
            ...config,
            audio: {
              ...config.audio,
              device_index: deviceIndex,
              microphone_device_index: micIndex,
            },
          });
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("audio.load_failed");
      setDevicesError(msg);
      setAudioDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  const loadPlaybackDevices = useCallback(async () => {
    try {
      const outputs = await electronService.getPlaybackDevices();
      setPlaybackDevices(outputs);
      if (!config) return;
      let outputIndex = config.audio?.tts_output_device_index ?? null;
      if (
        outputIndex == null ||
        !outputs.some((d) => d.index === outputIndex)
      ) {
        outputIndex =
          findPreferredVirtualCableDevice(outputs)?.index ??
          outputs[0]?.index ??
          null;
      }
      if (
        outputIndex !== null &&
        outputIndex !== config.audio?.tts_output_device_index
      ) {
        await updateConfig({
          ...config,
          audio: {
            ...config.audio,
            tts_output_device_index: outputIndex,
          },
        });
      }
    } catch {
      setPlaybackDevices([]);
    }
  }, [config, updateConfig]);

  useEffect(() => {
    if (isWindows) {
      loadAudioDevices();
      loadPlaybackDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when wizard opens on Windows
  }, [isWindows]);

  const selectedLoopbackIndex = config?.audio?.device_index ?? null;
  const selectedMicIndex = config?.audio?.microphone_device_index ?? null;
  const loopbackSelected =
    selectedLoopbackIndex !== null &&
    loopbackDevices.some((d) => d.index === selectedLoopbackIndex);
  const micSelected =
    selectedMicIndex !== null &&
    microphoneDevices.some((d) => d.index === selectedMicIndex);
  const canAdvanceFromLoopback =
    !isWindows || (loopbackSelected && loopbackDevices.length > 0);
  const canAdvanceFromMicrophone =
    !isWindows || (micSelected && microphoneDevices.length > 0);
  const virtualCableReady = hasVirtualCablePlaybackDevice(playbackDevices);
  const wantsVoiceOut = voiceOutIntent === "voice";
  const canAdvanceFromWelcome = voiceOutIntent !== null;

  const applyVoiceOutConfig = useCallback(async () => {
    if (!config) return;
    await updateConfig({
      ...config,
      translation: {
        ...config.translation,
        translate_to_teammates: true,
        tts_for_team_translations: true,
      },
      voice_output: {
        ...config.voice_output,
        mode: "virtual_mic",
        preset: config.voice_output?.preset ?? "game",
      },
    });
  }, [config, updateConfig]);

  const handleVoiceOutIntent = async (intent: VoiceOutIntent) => {
    setVoiceOutIntent(intent);
    if (intent === "voice") {
      await applyVoiceOutConfig();
      await loadPlaybackDevices();
    }
  };

  const renderDeviceSelect = (
    label: string,
    devices: AudioDevice[],
    selectedIndex: number | null,
    isSelected: boolean,
    onSelect: (index: number) => void,
    tip?: React.ReactNode
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        value={isSelected ? selectedIndex ?? "" : ""}
        onChange={(e) => {
          const deviceIndex = e.target.value
            ? parseInt(e.target.value, 10)
            : undefined;
          if (deviceIndex !== undefined) onSelect(deviceIndex);
        }}
      >
        <option value="">{t("setup_wizard.select_device")}</option>
        {devices.map((device) => (
          <option key={device.index} value={device.index}>
            {device.name}
            {device.is_loopback ? " [Loopback]" : ""} ({device.sample_rate}Hz,{" "}
            {device.channels}ch)
          </option>
        ))}
      </select>
      {tip}
    </div>
  );

  const markSetupComplete = useCallback(async () => {
    if (!config) return;
    await updateConfig({
      ...config,
      app: { ...config.app, setup_complete: true },
    });
  }, [config, updateConfig]);

  const handleFinish = async (startNow: boolean) => {
    await markSetupComplete();
    if (startNow && onStartCapture) {
      setStartingCapture(true);
      setCaptureError(null);
      try {
        await onStartCapture();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : t("audio.start_failed");
        setCaptureError(msg);
        setStartingCapture(false);
        return;
      }
      setStartingCapture(false);
    }
    onComplete?.();
  };

  const steps: { id: SetupStepId; title: string; content: React.ReactNode }[] = [
    {
      id: "welcome",
      title: t("setup_wizard.welcome_title_short"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            {t("setup_wizard.welcome_intro")}
          </p>
          {!isWindows && (
            <div className="bg-red-900/50 border border-red-600 p-4 rounded-lg">
              <h3 className="font-semibold text-red-200 mb-2">
                {t("setup_wizard.windows_required_title")}
              </h3>
              <p className="text-sm text-red-100">
                {t("setup_wizard.windows_required_message")}
              </p>
            </div>
          )}
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-white">
              {t("setup_wizard.what_this_app_does")}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>{t("setup_wizard.feature_capture_audio")}</li>
              <li>{t("setup_wizard.feature_transcribe")}</li>
              <li>{t("setup_wizard.feature_translate")}</li>
              <li>{t("setup_wizard.feature_subtitles")}</li>
            </ul>
          </div>
          {isWindows && (
            <p className="text-sm text-gray-400">
              {t("setup_wizard.windows_requirements")}
            </p>
          )}
          {isWindows && (
            <div className="rounded-lg border border-gray-600 bg-gray-900/60 p-4 space-y-3">
              <p className="text-sm font-semibold text-white">
                {t("setup_wizard.usage_intent_title")}
              </p>
              <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="setup-usage-intent"
                  checked={voiceOutIntent === "subtitles"}
                  onChange={() => handleVoiceOutIntent("subtitles")}
                  className="mt-1"
                />
                <span>{t("setup_wizard.usage_subtitles_only")}</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="setup-usage-intent"
                  checked={voiceOutIntent === "voice"}
                  onChange={() => handleVoiceOutIntent("voice")}
                  className="mt-1"
                />
                <span>{t("setup_wizard.usage_voice_out")}</span>
              </label>
              {voiceOutIntent === null && (
                <p className="text-xs text-amber-300">
                  {t("setup_wizard.usage_intent_required")}
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "loopback",
      title: t("setup_wizard.step_audio_output"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            {t("setup_wizard.audio_output_help")}
          </p>

          {devicesLoading && (
            <p className="text-gray-400 text-sm">{t("audio.loading_devices")}</p>
          )}

          {devicesError && (
            <div className="space-y-2">
              <p className="text-sm text-red-300">{devicesError}</p>
              <button
                type="button"
                onClick={() => loadAudioDevices()}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                {t("common.refresh")}
              </button>
            </div>
          )}

          {!devicesLoading &&
            !devicesError &&
            loopbackDevices.length > 0 &&
            config &&
            renderDeviceSelect(
              t("setup_wizard.game_audio_device"),
              loopbackDevices,
              selectedLoopbackIndex,
              loopbackSelected,
              (deviceIndex) => {
                updateConfig({
                  ...config,
                  audio: { ...config.audio, device_index: deviceIndex },
                });
              },
              loopbackSelected &&
                (() => {
                  const dev = loopbackDevices.find(
                    (d) => d.index === selectedLoopbackIndex
                  );
                  if (
                    dev &&
                    !dev.is_loopback &&
                    !dev.name.toLowerCase().includes("stereo mix")
                  ) {
                    return (
                      <p className="text-xs text-amber-400">
                        {t("setup_wizard.loopback_tip")}
                      </p>
                    );
                  }
                  return null;
                })()
            )}

          {!devicesLoading &&
            !devicesError &&
            audioDevices.length > 0 &&
            loopbackDevices.length === 0 && (
              <p className="text-sm text-yellow-300">
                {t("setup_wizard.no_loopback_devices")}
              </p>
            )}

          {!devicesLoading && !devicesError && audioDevices.length === 0 && (
            <p className="text-sm text-yellow-300">
              {t("setup_wizard.no_capture_devices")}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "microphone",
      title: t("setup_wizard.step_microphone"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            {t("setup_wizard.microphone_help")}
          </p>

          {devicesLoading && (
            <p className="text-gray-400 text-sm">{t("audio.loading_devices")}</p>
          )}

          {devicesError && (
            <div className="space-y-2">
              <p className="text-sm text-red-300">{devicesError}</p>
              <button
                type="button"
                onClick={() => loadAudioDevices()}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                {t("common.refresh")}
              </button>
            </div>
          )}

          {!devicesLoading &&
            !devicesError &&
            microphoneDevices.length > 0 &&
            config &&
            renderDeviceSelect(
              t("setup_wizard.microphone_device"),
              microphoneDevices,
              selectedMicIndex,
              micSelected,
              (deviceIndex) => {
                updateConfig({
                  ...config,
                  audio: {
                    ...config.audio,
                    microphone_device_index: deviceIndex,
                  },
                });
              }
            )}

          {!devicesLoading &&
            !devicesError &&
            audioDevices.length > 0 &&
            microphoneDevices.length === 0 && (
              <p className="text-sm text-yellow-300">
                {t("team.no_microphones")}
              </p>
            )}

          {!devicesLoading && !devicesError && audioDevices.length === 0 && (
            <p className="text-sm text-yellow-300">
              {t("setup_wizard.no_capture_devices")}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "translation",
      title: t("setup_wizard.step_translation_settings"),
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            {t("setup_wizard.translation_help")}
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t("translation.target_language")}
            </label>
            <select
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
              value={config?.translation?.target_language ?? "en"}
              onChange={(e) => {
                if (!config) return;
                updateConfig({
                  ...config,
                  translation: {
                    ...config.translation,
                    target_language: e.target.value,
                  },
                });
              }}
            >
              {TRANSLATION_LANGUAGE_OPTIONS.map((languageOption) => (
                <option key={languageOption.code} value={languageOption.code}>
                  {t(languageOption.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    ...(isWindows && wantsVoiceOut
      ? [
          {
            id: "virtual_cable" as const,
            title: t("setup_wizard.step_virtual_cable"),
            content: (
              <div className="space-y-4">
                <p className="text-gray-300">
                  {t("setup_wizard.virtual_cable_help")}
                </p>
                {virtualCableReady ? (
                  <p className="text-sm text-green-300">
                    {t("setup_wizard.virtual_cable_detected_continue")}
                  </p>
                ) : (
                  <VbAudioCableInstallPanel
                    playbackDevices={playbackDevices}
                    onDevicesRefresh={loadPlaybackDevices}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
    {
      id: "complete",
      title: t("setup_wizard.complete_title_short"),
      content: (
        <div className="space-y-4">
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">
              {t("setup_wizard.complete_heading")}
            </h3>
            <p className="text-sm text-green-200">
              {isWindows
                ? t("setup_wizard.complete_windows_message")
                : t("setup_wizard.complete_non_windows_message")}
            </p>
            {isWindows && (
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-200 mt-2">
                <li>{t("setup_wizard.complete_step_1")}</li>
                <li>{t("setup_wizard.complete_step_2")}</li>
                <li>{t("setup_wizard.complete_step_3")}</li>
              </ol>
            )}
          </div>
          {captureError && (
            <p className="text-sm text-red-300">{captureError}</p>
          )}
          <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>{t("setup_wizard.tip_label")}</strong>{" "}
              {t("setup_wizard.final_tip")}
            </p>
          </div>
          {isWindows && wantsVoiceOut && !virtualCableReady && (
            <div className="bg-amber-900/40 border border-amber-600/50 p-4 rounded-lg">
              <p className="text-sm text-amber-100">
                {t("setup_wizard.complete_voice_out_pending")}
              </p>
            </div>
          )}
          {isWindows && wantsVoiceOut && config?.voice_output?.preset === "discord" && (
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
              <p className="text-sm text-blue-100">
                <strong>Discord:</strong> Set Discord output to your normal
                headphones or speakers, then set Discord input to{" "}
                <strong>CABLE Output</strong> if you want translated outgoing
                voice to go through Discord.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  const currentStepId = steps[currentStep]?.id;
  const isVirtualCableStep = currentStepId === "virtual_cable";

  const handleNext = () => {
    if (currentStepId === "welcome" && !canAdvanceFromWelcome && isWindows) {
      return;
    }
    if (currentStepId === "loopback" && !canAdvanceFromLoopback) {
      return;
    }
    if (currentStepId === "microphone" && !canAdvanceFromMicrophone) {
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkipVirtualCable = () => {
    if (isVirtualCableStep && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    onClose?.();
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStep].title}
            </h2>
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-200 text-2xl"
              aria-label={t("setup_wizard.close_setup")}
            >
              {"\u00D7"}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>
                {t("setup_wizard.progress", {
                  current: currentStep + 1,
                  total: steps.length,
                })}
              </span>
              <span>
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mb-6">{steps[currentStep].content}</div>

          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  {t("setup_wizard.previous")}
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  {t("setup_wizard.skip")}
                </button>
              )}
              {isLastStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    disabled={startingCapture}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50"
                  >
                    {t("setup_wizard.done_for_now")}
                  </button>
                  {isWindows && onStartCapture && (
                    <button
                      type="button"
                      onClick={() => handleFinish(true)}
                      disabled={
                        startingCapture ||
                        selectedLoopbackIndex === null ||
                        selectedMicIndex === null
                      }
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                    >
                      {startingCapture
                        ? t("audio.starting")
                        : t("setup_wizard.start_capture_now")}
                    </button>
                  )}
                  {(!isWindows || !onStartCapture) && (
                    <button
                      type="button"
                      onClick={() => handleFinish(false)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      {t("setup_wizard.complete_button")}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {isVirtualCableStep && (
                    <button
                      type="button"
                      onClick={handleSkipVirtualCable}
                      className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                      {t("setup_wizard.virtual_cable_skip_button")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (currentStepId === "welcome" &&
                        isWindows &&
                        !canAdvanceFromWelcome) ||
                      (currentStepId === "loopback" && !canAdvanceFromLoopback) ||
                      (currentStepId === "microphone" &&
                        !canAdvanceFromMicrophone)
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("setup_wizard.next")}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
