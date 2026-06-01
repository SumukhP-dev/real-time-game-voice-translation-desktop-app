import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useConfig } from "../hooks/useConfig";
import { useTeammates } from "../hooks/useTeammates";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import electronService, {
  type AudioDevice,
  type PlaybackDevice,
  type VoiceOutputMode,
  type VoiceRoutingPreset,
} from "../services/electron";
import {
  filterDevicesByCaptureSource,
  findPreferredMicrophoneDevice,
  findPreferredVirtualCableDevice,
  hasVirtualCablePlaybackDevice,
} from "../utils/audioDevices";
import { VbAudioCableInstallPanel } from "./VbAudioCableInstallPanel";
import { TRANSLATION_LANGUAGE_OPTIONS } from "../i18n/languages";

export function TranslationToTeam() {
  const { config, updateConfig } = useConfig();
  const { teammates } = useTeammates();
  const { t } = useI18n();
  const [teamTargetLanguage, setTeamTargetLanguage] = useState<string>(
    config?.translation?.team_target_language || "en"
  );
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [playbackDevices, setPlaybackDevices] = useState<PlaybackDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  const useAutoDetect =
    config?.translation?.use_auto_detect_team_language ?? false;

  const microphoneDevices = useMemo(
    () => filterDevicesByCaptureSource(audioDevices, "microphone"),
    [audioDevices]
  );

  const selectedMicIndex = config?.audio?.microphone_device_index ?? null;
  const micSelected =
    selectedMicIndex !== null &&
    microphoneDevices.some((d) => d.index === selectedMicIndex);
  const selectedOutputIndex = config?.audio?.tts_output_device_index ?? null;
  const outputSelected =
    selectedOutputIndex !== null &&
    playbackDevices.some((d) => d.index === selectedOutputIndex);
  const ttsForTeam = config?.translation?.tts_for_team_translations ?? false;
  const outputMode: VoiceOutputMode =
    config?.voice_output?.mode ?? "virtual_mic";
  const routingPreset: VoiceRoutingPreset =
    config?.voice_output?.preset ?? "game";

  const loadAudioDevices = useCallback(async () => {
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const [devices, outputs] = await Promise.all([
        electronService.getAudioDevices(),
        electronService.getPlaybackDevices(),
      ]);
      setAudioDevices(devices);
      setPlaybackDevices(outputs);

      if (!config) return;

      const micFiltered = filterDevicesByCaptureSource(devices, "microphone");
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

      const updates: Partial<typeof config.audio> = {};
      if (
        micIndex !== null &&
        micIndex !== config.audio?.microphone_device_index
      ) {
        updates.microphone_device_index = micIndex;
      }
      if (
        outputIndex !== null &&
        outputIndex !== config.audio?.tts_output_device_index
      ) {
        updates.tts_output_device_index = outputIndex;
      }

      if (Object.keys(updates).length > 0) {
        await updateConfig({
          ...config,
          audio: {
            ...config.audio,
            ...updates,
          },
        });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load audio devices";
      setDevicesError(msg);
      setAudioDevices([]);
      setPlaybackDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }, [config, updateConfig]);

  useEffect(() => {
    if (config?.translation?.team_target_language) {
      setTeamTargetLanguage(config.translation.team_target_language);
    }
  }, [config?.translation?.team_target_language]);

  const isEnabled = config?.translation?.translate_to_teammates ?? false;

  useEffect(() => {
    if (isEnabled) {
      loadAudioDevices();
    }
  }, [isEnabled, loadAudioDevices]);

  const mostCommonLanguage = useMemo(() => {
    if (teammates.length === 0) return null;

    const languageCounts: Record<string, number> = {};
    teammates.forEach((tm) => {
      if (tm.primary_language) {
        languageCounts[tm.primary_language] =
          (languageCounts[tm.primary_language] || 0) + 1;
      }
      Object.entries(tm.detected_languages || {}).forEach(([lang, count]) => {
        languageCounts[lang] = (languageCounts[lang] || 0) + (count as number);
      });
    });

    let maxCount = 0;
    let mostCommon = null;
    Object.entries(languageCounts).forEach(([lang, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = lang;
      }
    });

    return mostCommon;
  }, [teammates]);

  const handleEnableToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        translation: {
          ...config.translation,
          translate_to_teammates: enabled,
        },
      });
    } catch (error) {
      console.error("Failed to update translate_to_teammates config:", error);
    }
  };

  const handleMicrophoneChange = async (deviceIndex: number) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        audio: {
          ...config.audio,
          microphone_device_index: deviceIndex,
        },
      });
    } catch (error) {
      console.error("Failed to update microphone_device_index:", error);
    }
  };

  const handleOutputDeviceChange = async (deviceIndex: number) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        audio: {
          ...config.audio,
          tts_output_device_index: deviceIndex,
        },
      });
    } catch (error) {
      console.error("Failed to update tts_output_device_index:", error);
    }
  };

  const handleTtsForTeamToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        translation: {
          ...config.translation,
          tts_for_team_translations: enabled,
        },
      });
    } catch (error) {
      console.error("Failed to update tts_for_team_translations:", error);
    }
  };

  const handleOutputModeChange = async (mode: VoiceOutputMode) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        voice_output: {
          ...config.voice_output,
          mode,
        },
      });
    } catch (error) {
      console.error("Failed to update voice_output.mode:", error);
    }
  };

  const handleRoutingPresetChange = async (preset: VoiceRoutingPreset) => {
    if (!config) return;
    try {
      const enableDiscordRouting = preset === "discord";
      await updateConfig({
        ...config,
        translation: {
          ...config.translation,
          translate_to_teammates: enableDiscordRouting
            ? true
            : config.translation.translate_to_teammates,
          tts_for_team_translations: enableDiscordRouting
            ? true
            : config.translation.tts_for_team_translations,
        },
        voice_output: {
          ...config.voice_output,
          preset,
          mode: enableDiscordRouting ? "virtual_mic" : config.voice_output?.mode,
        },
      });

      if (enableDiscordRouting) {
        await loadAudioDevices();
      }
    } catch (error) {
      console.error("Failed to update routing preset:", error);
    }
  };

  const handleTargetLanguageChange = async (language: string) => {
    setTeamTargetLanguage(language);
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        translation: {
          ...config.translation,
          team_target_language: language,
        },
      });
    } catch (error) {
      console.error("Failed to update team target language:", error);
    }
  };

  const handleAutoDetectToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      await updateConfig({
        ...config,
        translation: {
          ...config.translation,
          use_auto_detect_team_language: enabled,
        },
      });
    } catch (error) {
      console.error("Failed to update use_auto_detect_team_language:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-white">
        {t(I18N_KEYS.TEAM_TRANSLATION)}
      </h2>

      <div className="space-y-4">
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">
                Voice routing preset
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Use Game for in-game voice chat, or Discord to route translated
                speech through VB-Audio Virtual Cable for Discord desktop.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
              <button
                type="button"
                onClick={() => handleRoutingPresetChange("game")}
                className={`px-3 py-2 text-sm ${
                  routingPreset === "game"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Game
              </button>
              <button
                type="button"
                onClick={() => handleRoutingPresetChange("discord")}
                className={`px-3 py-2 text-sm ${
                  routingPreset === "discord"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Discord
              </button>
            </div>
          </div>

          {routingPreset === "discord" && (
            <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-100 space-y-2">
              <p>
                Discord desktop preset is active. SquadSpeak will capture
                incoming voice from your normal headphones/speakers and send
                translated outgoing speech through your virtual mic path.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-100">
                <li>Set Discord output to your usual headphones or speakers.</li>
                <li>Set Discord input to <strong>CABLE Output</strong>.</li>
                <li>
                  In SquadSpeak, keep the TTS output device on{" "}
                  <strong>CABLE Input</strong> and output mode on virtual mic.
                </li>
              </ol>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleEnableToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span className="font-semibold">{t(I18N_KEYS.TEAM_ENABLE)}</span>
          </label>
          {isEnabled && (
            <p className="text-xs text-gray-400 ml-6 mt-1">
              {t("team.enable_help")}
            </p>
          )}
        </div>

        {isEnabled && (
          <>
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {t(I18N_KEYS.TEAM_MICROPHONE)}
              </label>
              <p className="text-xs text-gray-400">
                {t(I18N_KEYS.TEAM_MICROPHONE_HELP)}
              </p>

              {devicesLoading && (
                <p className="text-gray-400 text-sm">
                  {t("audio.loading_devices")}
                </p>
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
                microphoneDevices.length > 0 && (
                  <select
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={micSelected ? selectedMicIndex ?? "" : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value !== "") {
                        handleMicrophoneChange(parseInt(value, 10));
                      }
                    }}
                  >
                    <option value="">{t("team.select_device")}</option>
                    {microphoneDevices.map((device) => (
                      <option key={device.index} value={device.index}>
                        {device.name} ({device.sample_rate}Hz, {device.channels}
                        ch)
                      </option>
                    ))}
                  </select>
                )}

              {!devicesLoading &&
                !devicesError &&
                audioDevices.length > 0 &&
                microphoneDevices.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-yellow-300">
                      {t(I18N_KEYS.TEAM_NO_MICROPHONES)}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadAudioDevices()}
                      className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md"
                    >
                      {t("common.refresh")}
                    </button>
                  </div>
                )}
            </div>

            <div className="border-t border-gray-700 pt-3 space-y-3">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={ttsForTeam}
                  onChange={(e) => handleTtsForTeamToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold">
                  {t("team.tts_enable")}
                </span>
              </label>
              <p className="text-xs text-gray-400 ml-6">
                {t("team.tts_help_prefix")} <strong>CABLE Output</strong>{" "}
                {t("team.tts_help_suffix")}
              </p>

              {ttsForTeam && outputMode !== "speakers" && (
                <VbAudioCableInstallPanel
                  playbackDevices={playbackDevices}
                  onDevicesRefresh={loadAudioDevices}
                />
              )}

              {ttsForTeam && (
                <div className="space-y-3 ml-2 pl-2 border-l border-gray-600">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {t("team.output_method")}
                    </label>
                    <select
                      className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                      value={outputMode}
                      onChange={(e) =>
                        handleOutputModeChange(e.target.value as VoiceOutputMode)
                      }
                    >
                      <option value="virtual_mic">{t("team.output_virtual_mic")}</option>
                      <option value="speakers">{t("team.output_speakers")}</option>
                      <option value="both">{t("team.output_both")}</option>
                    </select>
                  </div>

                  {outputMode !== "speakers" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t("team.virtual_cable_device")}
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        {t("team.virtual_cable_help_prefix")}{" "}
                        <strong>CABLE Input</strong>{" "}
                        {t("team.virtual_cable_help_suffix")}
                      </p>
                      {!devicesLoading && playbackDevices.length > 0 && (
                        <select
                          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                          value={
                            outputSelected ? selectedOutputIndex ?? "" : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value !== "") {
                              handleOutputDeviceChange(parseInt(value, 10));
                            }
                          }}
                        >
                          <option value="">{t("team.select_playback_device")}</option>
                          {playbackDevices.map((device) => (
                            <option key={device.index} value={device.index}>
                              {device.name}
                              {device.is_default
                                ? ` ${t("team.default_device_badge")}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      )}
                      {!devicesLoading &&
                        playbackDevices.length === 0 &&
                        !hasVirtualCablePlaybackDevice(playbackDevices) && (
                        <p className="text-sm text-yellow-300">
                          {t("team.no_playback_devices")}
                        </p>
                      )}
                      {routingPreset === "discord" && outputSelected && (
                        <p className="mt-2 text-xs text-green-300">
                          Discord preset: keep Discord input on CABLE Output and
                          this setting on CABLE Input.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-sm font-semibold text-gray-300 mb-3">
                {t(I18N_KEYS.TEAM_LANGUAGE_SELECTION)}
              </div>

              <label className="flex items-center space-x-2 text-sm text-gray-300 mb-3">
                <input
                  type="checkbox"
                  checked={useAutoDetect}
                  onChange={(e) => handleAutoDetectToggle(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span>{t(I18N_KEYS.TEAM_AUTO_DETECT)}</span>
              </label>

              {!useAutoDetect && (
                <div className="p-3 bg-gray-900 rounded">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t(I18N_KEYS.TEAM_TARGET_LANGUAGE)}
                  </label>
                  <select
                    value={teamTargetLanguage}
                    onChange={(e) => handleTargetLanguageChange(e.target.value)}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {TRANSLATION_LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {t(lang.labelKey)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    {t("team.target_language_help")}
                  </p>
                </div>
              )}

              {useAutoDetect && (
                <div className="p-3 bg-gray-900 rounded">
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    {t("team.auto_detected_language")}
                  </div>
                  {mostCommonLanguage ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-300">
                        {t(
                          TRANSLATION_LANGUAGE_OPTIONS.find(
                            (l) => l.code === mostCommonLanguage
                          )?.labelKey || "team.language_unknown"
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {t("team.auto_detected_summary", {
                          count: teammates.length,
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {t("team.no_teammates_detected")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
