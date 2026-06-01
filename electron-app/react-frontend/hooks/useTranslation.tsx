import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import electronService from "../services/electron";
import { isSameLanguagePassthroughTranslation } from "../utils/translationFiltering";

export interface Translation {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

type TranslationContextValue = {
  targetLanguage: string;
  setTargetLanguage: (lang: string) => void;
  translations: Translation[];
  isTranslating: boolean;
  error: string | null;
  translate: (
    text: string,
    sourceLanguage?: string,
    overrideTargetLanguage?: string
  ) => Promise<Translation | undefined>;
  clearTranslations: () => void;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

function useTranslationState(): TranslationContextValue {
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (
      text: string,
      sourceLanguage?: string,
      overrideTargetLanguage?: string
    ) => {
      if (!text.trim()) return;

      try {
        setIsTranslating(true);
        setError(null);

        const targetLang = overrideTargetLanguage || targetLanguage;

        const result = await electronService.translateText(
          text,
          targetLang,
          sourceLanguage || undefined
        );

        const translation: Translation = {
          original: text,
          translated: result.translated_text,
          sourceLanguage: result.source_language,
          targetLanguage: result.target_language,
          timestamp: Date.now(),
        };

        if (
          !overrideTargetLanguage &&
          !isSameLanguagePassthroughTranslation(translation)
        ) {
          setTranslations((prev) => [translation, ...prev].slice(0, 50));
        }
        return translation;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Translation failed";
        setError(errorMsg);
        throw err;
      } finally {
        setIsTranslating(false);
      }
    },
    [targetLanguage]
  );

  const clearTranslations = useCallback(() => {
    setTranslations([]);
  }, []);

  return {
    targetLanguage,
    setTargetLanguage,
    translations,
    isTranslating,
    error,
    translate,
    clearTranslations,
  };
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const value = useTranslationState();
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextValue {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return ctx;
}
