import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useConfig } from "../hooks/useConfig";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import { TRANSLATION_LANGUAGE_OPTIONS } from "../i18n/languages";

export function TranslationSettings() {
  const { targetLanguage, setTargetLanguage } = useTranslation();
  const { config, updateConfig } = useConfig();
  const { t } = useI18n();

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
      // Mock implementation - overlay config is already updated via updateConfig
      console.log('Mock: updateOverlayConfig', newConfig.overlay);
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.TRANSLATION_TARGET_LANGUAGE)}
          </label>
          <select
            value={config?.translation?.target_language ?? targetLanguage}
            onChange={async (e) => {
              const code = e.target.value;
              setTargetLanguage(code);
              if (!config) return;
              try {
                await updateConfig({
                  ...config,
                  translation: {
                    ...config.translation,
                    target_language: code,
                  },
                });
              } catch (err) {
                console.error("Failed to save target language:", err);
              }
            }}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {TRANSLATION_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {t(lang.labelKey)}
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
                  // Mock implementation - overlay config is already updated via updateConfig
                  console.log('Mock: updateOverlayConfig', newConfig.overlay);
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

