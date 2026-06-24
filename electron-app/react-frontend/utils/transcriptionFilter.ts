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
  /ese es un juego/i,
  /game of life/i,
  /^¡?es son/i,
  /^¡?es sonido/i,
  /^¡?c[ií]tio/i,
];

/** Single-word noise misheard from SFX / silence between callouts. */
const SHORT_NOISE_PATTERNS = [
  /^¡?vale[!.]?$/i,
  /^¡?vos[!.]?$/i,
  /^¡?es sonido[!.]?$/i,
  /^¡?c[ií]tio[!.]?$/i,
];

/** Whisper on game SFX/music often emits the same token dozens of times in one chunk. */
function isRepetitiveHallucination(text: string): boolean {
  const trimmed = text.trim();
  // ~1.2s callout chunks should not produce essay-length captions
  if (trimmed.length > 100) return true;

  const phrases = trimmed
    .split(/[!?.…]+/)
    .map((s) => s.replace(/[¡¿]/g, "").trim().toLowerCase())
    .filter((s) => s.length > 0);

  if (phrases.length >= 4) {
    const first = phrases[0];
    const same = phrases.filter((p) => p === first).length;
    if (same >= 4 && same / phrases.length >= 0.75) return true;
  }

  const words = trimmed
    .toLowerCase()
    .replace(/[¡¿!?.…,]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 6) {
    const counts = new Map<string, number>();
    for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
    const max = Math.max(...counts.values());
    if (max >= 5 && max / words.length >= 0.6) return true;
  }

  return false;
}

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
  if (/plant/i.test(lower) || /protachos/i.test(lower)) return "Planting";
  if (/rotar|rotate/i.test(lower)) return "Rotate";
  if (/último|ultimo|last.*site/i.test(lower) || /^¡?bah[!.]?$/i.test(lower) || /^¡?uh+h[!.]?$/i.test(lower))
    return "Last on site";
  if (/uno.*cort/i.test(lower)) return "One short";

  return trimmed;
}

export function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  if (CALLOUT_HINTS.some((re) => re.test(lower))) return false;
  if (isRepetitiveHallucination(trimmed)) return true;
  if (SHORT_NOISE_PATTERNS.some((re) => re.test(trimmed))) return true;
  if (HALLUCINATION_PATTERNS.some((re) => re.test(lower))) return true;
  if (LANGUAGE_LABEL_PATTERNS.some((re) => re.test(lower))) return true;
  if (GARBAGE_PATTERNS.some((re) => re.test(lower))) return true;

  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length === 1 && trimmed.length < 4) return true;

  return false;
}
