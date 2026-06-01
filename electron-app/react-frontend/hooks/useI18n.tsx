import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useConfig } from "./useConfig";
import {
  getTranslation,
  type TranslationParams,
} from "../i18n/translations";

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { config, updateConfig, loading } = useConfig();
  const [language, setLanguageState] = useState<string>("en");

  // Load language from config on mount
  useEffect(() => {
    if (config?.app?.ui_language) {
      setLanguageState(config.app.ui_language);
    }
  }, [config?.app?.ui_language]);

  const setLanguage = async (lang: string) => {
    if (!config) {
      console.warn("Cannot update language: config not loaded yet");
      return;
    }
    try {
      setLanguageState(lang);
      const newConfig = {
        ...config,
        app: {
          setup_complete: config.app?.setup_complete || false,
          ui_language: lang,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update UI language:", error);
    }
  };

  const t = (key: string, params?: TranslationParams): string => {
    try {
      return getTranslation(language, key, params);
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key; // Fallback to key itself
    }
  };

  // Always provide the context, even while loading
  // Children can check loading state themselves if needed
  const contextValue = { language, setLanguage, t };
  const loadingTitle = getTranslation(language, "app.loading_configuration_title");
  const loadingMessage = getTranslation(
    language,
    "app.loading_configuration_message"
  );
  const loadingHint = getTranslation(language, "app.loading_configuration_hint");

  return (
    <I18nContext.Provider value={contextValue}>
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "100vh" }}>
          <h2>{loadingTitle}</h2>
          <p>{loadingMessage}</p>
          <p style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
            {loadingHint}
          </p>
        </div>
      ) : (
        children
      )}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}


