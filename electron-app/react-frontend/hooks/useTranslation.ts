import { useState, useCallback } from "react";
import * as tauri from "../services/tauri";

export interface Translation {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

export function useTranslation() {
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

        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H1",
            location: "useTranslation.ts:translate:before",
            message: "Calling translateText",
            data: { text, sourceLanguage, targetLang },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        const result = await tauri.translateText(
          text,
          sourceLanguage,
          targetLang
        );

        const translation: Translation = {
          original: text,
          translated: result.translated_text,
          sourceLanguage: result.source_language,
          targetLanguage: result.target_language,
          timestamp: Date.now(),
        };

        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H2",
            location: "useTranslation.ts:translate:after",
            message: "Received translateText result",
            data: { result, translation },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        // Only add to history if using default target language
        if (!overrideTargetLanguage) {
          setTranslations((prev) => [translation, ...prev].slice(0, 50)); // Keep last 50
        }
        return translation;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Translation failed";
        setError(errorMsg);

        // #region agent log
        fetch("http://127.0.0.1:7243/ingest/7e01f89d-1ebb-4da9-9caa-95c9762604fb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: "debug-session",
            runId: "pre-fix",
            hypothesisId: "H3",
            location: "useTranslation.ts:translate:error",
            message: "translateText threw",
            data: { error: errorMsg },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

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
