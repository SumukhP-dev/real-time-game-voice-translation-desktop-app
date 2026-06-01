type TranslationLike = {
  original?: string;
  translated?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  source_lang?: string;
  target_lang?: string;
};

function normalizeLanguageCode(code?: string): string {
  return (code || "").trim().toLowerCase().split("-")[0];
}

function normalizeComparableText(text?: string): string {
  return (text || "").trim().replace(/\s+/g, " ");
}

export function isSameLanguagePassthroughTranslation(
  translation: TranslationLike
): boolean {
  const source = normalizeLanguageCode(
    translation.sourceLanguage ?? translation.source_lang
  );
  const target = normalizeLanguageCode(
    translation.targetLanguage ?? translation.target_lang
  );

  if (!source || !target || source !== target) {
    return false;
  }

  return (
    normalizeComparableText(translation.original) ===
    normalizeComparableText(translation.translated)
  );
}
