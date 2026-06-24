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

const GAMING_CALLOUT_PATTERNS: Array<[RegExp, string]> = [
  [/rush\s*b/i, "Rush B!"],
  [/^plant/i, "Planting"],
  [/rotat|rotar/i, "Rotate"],
  [/last.*site|último.*sitio|ultimo.*sitio/i, "Last on site"],
  [/one\s+short|uno.*cort/i, "One short"],
];

function resolveGamingCallout(text: string, targetLang: string): string | null {
  if (normalizeLanguageCode(targetLang) !== "en") return null;
  const lower = text.trim().toLowerCase();
  if (!lower) return null;
  for (const [re, canonical] of GAMING_CALLOUT_PATTERNS) {
    if (re.test(lower)) return canonical;
  }
  return null;
}

function isBadCalloutTranslation(source: string, translated: string): boolean {
  const src = source.trim();
  const out = translated.trim();
  if (!out) return true;
  if (out.includes("_")) return true;
  const outL = out.toLowerCase();
  const srcL = src.toLowerCase();
  if (outL.includes("wheel") && !srcL.includes("wheel")) return true;
  if (outL.includes("child") && !srcL.includes("child")) return true;
  if (src.split(/\s+/).length <= 5 && out.split(/\s+/).length > src.split(/\s+/).length + 2) {
    return true;
  }
  return false;
}

/** Fix opus-mt garbage on short gaming callouts (client-side safety net). */
export function fixGamingTranslation(
  original: string,
  translated: string,
  targetLanguage: string
): string {
  const callout = resolveGamingCallout(original, targetLanguage);
  if (callout && isBadCalloutTranslation(original, translated)) {
    return callout;
  }
  if (callout && normalizeComparableText(original).toLowerCase() === callout.toLowerCase()) {
    return callout;
  }
  if (isBadCalloutTranslation(original, translated)) {
    return resolveGamingCallout(original, targetLanguage) ?? original.trim();
  }
  return translated;
}
