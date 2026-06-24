/** Common Whisper hallucinations on noise / game audio (especially after bad preprocessing). */
const HALLUCINATION_PATTERNS = [
  /ご視聴ありがとうございました/i,
  /ご視聴ありがとうございます/i,
  /ありがとうございました/i,
  /thank you for watching/i,
  /thanks for watching/i,
  /see you next time/i,
  /see you in the next/i,
  /i'll see you next/i,
  /please subscribe/i,
  /don't forget to subscribe/i,
  /subtitles by/i,
  /amara\.org/i,
  /please, and i'll see you/i,
];

/** Whisper often emits language labels on noise — not real callouts. */
const LANGUAGE_LABEL_PATTERNS = [
  /^(english|spanish|russian|german|french|portuguese|chinese|japanese)\.?$/i,
];

/** Short ranked callouts — never treat as hallucinations. */
const CALLOUT_HINTS = [
  /rush/i,
  /plant/i,
  /rotar/i,
  /rotate/i,
  /site/i,
  /mid/i,
  /bee+f/i,
  /corta/i,
  /último/i,
  /ultimo/i,
];

/** Fragmentary garbage common on 1s Whisper chunks over game SFX. */
const GARBAGE_PATTERNS = [
  /^[a-z]{1,2}$/i,
  /^[^a-zA-Z0-9\s]{0,2}$/,
  /^(draw it|you same|for that)\.?$/i,
];

/** Fix common Whisper mishearings of Spanish gaming callouts. */
export function normalizeMisheardCallout(text: string): string {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (/rush\s+bee?f/i.test(lower) || /^rush\s*b[!.]?$/i.test(lower)) {
    return "Rush B!";
  }
  if (/roch\s*b/i.test(lower)) return "Rush B!";
  if (/russian\s+b/i.test(lower) || /^rus+\s*b/i.test(lower)) return "Rush B!";
  if (/rosh\s*b/i.test(lower)) return "Rush B!";
  if (/plant/i.test(lower)) return "Planting";
  if (/rotar|rotate/i.test(lower)) return "Rotate";
  if (/último|ultimo|last.*site/i.test(lower)) return "Last on site";
  if (/uno.*cort/i.test(lower)) return "One short";

  return trimmed;
}

export function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  if (CALLOUT_HINTS.some((re) => re.test(lower))) return false;
  if (HALLUCINATION_PATTERNS.some((re) => re.test(lower))) return true;
  if (LANGUAGE_LABEL_PATTERNS.some((re) => re.test(lower))) return true;
  if (GARBAGE_PATTERNS.some((re) => re.test(lower))) return true;

  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length === 1 && trimmed.length < 4) return true;

  return false;
}
