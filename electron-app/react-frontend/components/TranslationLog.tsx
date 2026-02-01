import React from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

export function TranslationLog() {
  const { translations, clearTranslations, error } = useTranslation();
  const { t } = useI18n();

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{t(I18N_KEYS.MAIN_TRANSLATION_LOG)}</h2>
        <button
          onClick={clearTranslations}
          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
        >
          {t(I18N_KEYS.COMMON_CLEAR)}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-600 text-white rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {translations.length === 0 ? (
          <p className="text-gray-400 text-sm">{t(I18N_KEYS.MAIN_NO_TRANSLATIONS)}</p>
        ) : (
          translations.map((translation, index) => (
            <div key={index} className="p-3 bg-gray-700 rounded text-sm">
              <div className="text-gray-300 mb-1">
                <span className="font-semibold">
                  [{translation.sourceLanguage}→{translation.targetLanguage}]
                </span>
              </div>
              <div className="text-white mb-1">{translation.original}</div>
              <div className="text-green-300">→ {translation.translated}</div>
              <div className="text-gray-500 text-xs mt-1">
                {new Date(translation.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
