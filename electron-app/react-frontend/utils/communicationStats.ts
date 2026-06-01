export interface TranslationRecord {
  original: string;
  translated: string;
  source_lang: string;
  target_lang: string;
  timestamp: string;
  processing_ms?: number;
}

export interface MatchSession {
  id: string;
  gameMode: string;
  start_time: string;
  end_time?: string;
  total_translations: number;
  translations: TranslationRecord[];
}

export interface CommunicationStats {
  totalMessages: number;
  messagesPerMinute: number;
  languageDiversity: number;
  responseTime: number;
  most_common_languages: string[];
  uniqueLanguages: number;
  avgTranslationTime: number;
  total_duration_seconds: number;
}

export const EMPTY_COMMUNICATION_STATS: CommunicationStats = {
  totalMessages: 0,
  messagesPerMinute: 0,
  languageDiversity: 0,
  responseTime: 0,
  most_common_languages: [],
  uniqueLanguages: 0,
  avgTranslationTime: 0,
  total_duration_seconds: 0,
};

function normalizeLang(code: string | undefined): string | null {
  if (!code) return null;
  const base = code.trim().toLowerCase().split("-")[0];
  return base.length >= 2 ? base : null;
}

export function computeCommunicationStats(
  sessions: MatchSession[]
): CommunicationStats {
  const translations = sessions.flatMap((s) => s.translations);

  if (translations.length === 0) {
    return EMPTY_COMMUNICATION_STATS;
  }

  const langCounts: Record<string, number> = {};
  for (const t of translations) {
    for (const lang of [normalizeLang(t.source_lang), normalizeLang(t.target_lang)]) {
      if (lang) langCounts[lang] = (langCounts[lang] || 0) + 1;
    }
  }

  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const langTotal = sortedLangs.reduce((sum, [, c]) => sum + c, 0);
  const uniqueLanguages = sortedLangs.length;

  let sumSquares = 0;
  for (const [, count] of sortedLangs) {
    const p = count / langTotal;
    sumSquares += p * p;
  }
  const languageDiversity = langTotal > 0 ? 1 - sumSquares : 0;

  const timestamps = translations
    .map((t) => new Date(t.timestamp).getTime())
    .filter((n) => !Number.isNaN(n));
  const sessionStarts = sessions
    .map((s) => new Date(s.start_time).getTime())
    .filter((n) => !Number.isNaN(n));
  const sessionEnds = sessions
    .map((s) => (s.end_time ? new Date(s.end_time).getTime() : Date.now()))
    .filter((n) => !Number.isNaN(n));

  const rangeStart =
    timestamps.length > 0
      ? Math.min(...timestamps, ...(sessionStarts.length ? sessionStarts : timestamps))
      : Date.now();
  const rangeEnd =
    timestamps.length > 0
      ? Math.max(...timestamps, ...(sessionEnds.length ? sessionEnds : timestamps))
      : Date.now();
  const total_duration_seconds = Math.max(1, (rangeEnd - rangeStart) / 1000);
  const durationMinutes = total_duration_seconds / 60;

  const processingSamples = translations
    .map((t) => t.processing_ms)
    .filter((ms): ms is number => typeof ms === "number" && ms > 0);
  const avgTranslationTime =
    processingSamples.length > 0
      ? processingSamples.reduce((a, b) => a + b, 0) / processingSamples.length / 1000
      : 0;

  return {
    totalMessages: translations.length,
    messagesPerMinute:
      durationMinutes > 0
        ? Math.round((translations.length / durationMinutes) * 10) / 10
        : 0,
    languageDiversity,
    responseTime: Math.round(avgTranslationTime * 10) / 10,
    most_common_languages: sortedLangs.slice(0, 5).map(([lang]) => lang),
    uniqueLanguages,
    avgTranslationTime,
    total_duration_seconds,
  };
}
