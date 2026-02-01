import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useConfig } from "./useConfig";
import { translations, getTranslation } from "../i18n/translations";
import type { I18NKey } from "../i18n/keys";

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: I18NKey) => string;
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
          ...config.app,
          ui_language: lang,
        },
      };
      await updateConfig(newConfig);
    } catch (error) {
      console.error("Failed to update UI language:", error);
    }
  };

  const t = (key: I18NKey): string => {
    try {
      return getTranslation(language, key);
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key; // Fallback to key itself
    }
  };

  // Always provide the context, even while loading
  // Children can check loading state themselves if needed
  const contextValue = { language, setLanguage, t };

  return (
    <I18nContext.Provider value={contextValue}>
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#1a1a1a", color: "#fff", minHeight: "100vh" }}>
          <h2>Loading configuration...</h2>
          <p>Please wait while the app initializes.</p>
          <p style={{ marginTop: "20px", fontSize: "12px", color: "#888" }}>
            If this takes more than 10 seconds, check the console for errors.
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


