import React, { useState, useEffect, useMemo } from "react";
import { useConfig } from "../hooks/useConfig";
import { useTeammates } from "../hooks/useTeammates";
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

export function TranslationToTeam() {
  const { config, updateConfig } = useConfig();
  const { teammates } = useTeammates();
  const { t } = useI18n();
  const [teamTargetLanguage, setTeamTargetLanguage] = useState<string>(
    config?.translation?.team_target_language || "en"
  );
  const useAutoDetect =
    config?.translation?.use_auto_detect_team_language ?? false;

  // Sync state with config changes
  useEffect(() => {
    if (config?.translation?.team_target_language) {
      setTeamTargetLanguage(config.translation.team_target_language);
    }
  }, [config?.translation?.team_target_language]);

  // Calculate most common language from teammates
  const mostCommonLanguage = useMemo(() => {
    if (teammates.length === 0) return null;

    // Count language occurrences
    const languageCounts: Record<string, number> = {};
    teammates.forEach((t) => {
      if (t.primary_language) {
        languageCounts[t.primary_language] =
          (languageCounts[t.primary_language] || 0) + 1;
      }
      // Also count detected languages
      Object.entries(t.detected_languages || {}).forEach(([lang, count]) => {
        languageCounts[lang] = (languageCounts[lang] || 0) + (count as number);
      });
    });

    // Find most common
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
      const newConfig = {
        ...config,
        translation: {
          ...config.translation,
          translate_to_teammates: enabled,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update translate_to_teammates config:", error);
    }
  };

  const handleTargetLanguageChange = async (language: string) => {
    setTeamTargetLanguage(language);
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        translation: {
          ...config.translation,
          team_target_language: language,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update team target language:", error);
    }
  };

  const handleAutoDetectToggle = async (enabled: boolean) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        translation: {
          ...config.translation,
          use_auto_detect_team_language: enabled,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update use_auto_detect_team_language:", error);
    }
  };

  const isEnabled = config?.translation?.translate_to_teammates ?? false;

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">{t(I18N_KEYS.TEAM_TRANSLATION)}</h2>

      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
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
              Translate game audio to team languages and display in overlay.
            </p>
          )}
        </div>

        {isEnabled && (
          <>
            {/* Language Selection Mode */}
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
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    All team translations will be converted to this language.
                  </p>
                </div>
              )}

              {useAutoDetect && (
                <div className="p-3 bg-gray-900 rounded">
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    Auto-detected Language
                  </div>
                  {mostCommonLanguage ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-300">
                        {LANGUAGES.find((l) => l.code === mostCommonLanguage)
                          ?.name || mostCommonLanguage}
                      </div>
                      <p className="text-xs text-gray-400">
                        Most common language detected from {teammates.length}{" "}
                        teammate{teammates.length !== 1 ? "s" : ""}.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No teammates detected yet. Start capturing audio to detect
                      teammates.
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
