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

/** Fragmentary garbage common on 1s Whisper chunks over game SFX. */
const GARBAGE_PATTERNS = [
  /^[a-z]{1,3}$/i,
  /^[^a-zA-Z0-9\s]{0,3}$/,
  /^(draw it|you same|for that|me)\.?$/i,
];

export function isLikelyHallucination(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const lower = trimmed.toLowerCase();
  if (HALLUCINATION_PATTERNS.some((re) => re.test(lower))) return true;
  if (GARBAGE_PATTERNS.some((re) => re.test(lower))) return true;

  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length <= 2 && trimmed.length < 14) return true;

  return false;
}
