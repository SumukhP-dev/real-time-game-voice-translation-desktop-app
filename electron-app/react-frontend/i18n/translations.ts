import de from "../../../locales/de.json";
import en from "../../../locales/en.json";
import es from "../../../locales/es.json";
import fr from "../../../locales/fr.json";
import pt from "../../../locales/pt.json";
import ru from "../../../locales/ru.json";

export type TranslationValue = string | number | boolean | null | undefined;
export type TranslationParams = Record<string, TranslationValue>;
type TranslationTree = Record<string, unknown>;

export const translations: Record<string, TranslationTree> = {
  en,
  es,
  fr,
  de,
  pt,
  ru,
};

function normalizeLanguage(lang: string): string {
  return lang.toLowerCase().split("-")[0];
}

function getNestedValue(tree: TranslationTree, key: string): unknown {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return undefined;
    }
    return (value as Record<string, unknown>)[segment];
  }, tree);
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, token: string) => {
    const value = params[token];
    return value == null ? `{${token}}` : String(value);
  });
}

export function getTranslation(
  lang: string,
  key: string,
  params?: TranslationParams
): string {
  const normalizedLang = normalizeLanguage(lang);
  const requestedTree = translations[normalizedLang] || translations.en;
  const requestedValue = getNestedValue(requestedTree, key);

  if (typeof requestedValue === "string") {
    return interpolate(requestedValue, params);
  }

  const englishValue = getNestedValue(translations.en, key);
  if (typeof englishValue === "string") {
    return interpolate(englishValue, params);
  }

  return key;
}

