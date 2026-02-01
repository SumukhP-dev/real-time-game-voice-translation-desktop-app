import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useConfig } from "../hooks/useConfig";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import * as tauri from "../services/tauri";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
];

export function TranslationSettings() {
  const { targetLanguage, setTargetLanguage } = useTranslation();
  const { config, updateConfig } = useConfig();
  const { language: uiLanguage, setLanguage: setUiLanguage, t } = useI18n();

  const handleOverlayToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        overlay: {
          ...config.overlay,
          enabled: enabled,
        },
      };
      await updateConfig(newConfig);
      // Sync overlay config
      await tauri.updateOverlayConfig(newConfig.overlay);
    } catch (error) {
      console.error("Failed to update overlay config:", error);
    }
  };

  const handleTTSToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        tts: {
          ...config.tts,
          enabled: enabled,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update TTS config:", error);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">
        {t(I18N_KEYS.TRANSLATION_SETTINGS)}
      </h2>

      <div className="space-y-4">
        {/* UI Language Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.TRANSLATION_UI_LANGUAGE)}
          </label>
          <select
            value={uiLanguage}
            onChange={(e) => setUiLanguage(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.TRANSLATION_TARGET_LANGUAGE)}
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={config?.overlay?.enabled ?? true}
              onChange={(e) => handleOverlayToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>{t(I18N_KEYS.TRANSLATION_ENABLE_OVERLAY)}</span>
          </label>

          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={config?.tts?.enabled ?? false}
              onChange={(e) => handleTTSToggle(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>{t(I18N_KEYS.TRANSLATION_ENABLE_TTS)}</span>
          </label>

          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={config?.overlay?.show_same_language ?? false}
              onChange={async (e) => {
                if (!config) return;
                try {
                  const newConfig = {
                    ...config,
                    overlay: {
                      ...config.overlay,
                      show_same_language: e.target.checked,
                    },
                  };
                  await updateConfig(newConfig);
                  await tauri.updateOverlayConfig(newConfig.overlay);
                } catch (error) {
                  console.error(
                    "Failed to update show_same_language config:",
                    error
                  );
                }
              }}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>{t(I18N_KEYS.TRANSLATION_SHOW_SAME_LANGUAGE)}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
