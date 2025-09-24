import { Locale, defaultLocale } from './config';

// Import translation files
import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import es from './locales/es.json';
import en from './locales/en.json';

const translations = {
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  'es': es,
  'en': en
} as const;

export type TranslationKey = keyof typeof ptBR;

/**
 * Get translation for a given key and locale
 * @param key - Translation key using dot notation (e.g., 'hero.title')
 * @param locale - Target locale
 * @returns Translated string or key if not found
 */
export function getTranslation(key: string, locale: Locale = defaultLocale): string {
  const localeTranslations = translations[locale];
  
  if (!localeTranslations) {
    console.warn(`Locale '${locale}' not found, falling back to ${defaultLocale}`);
    return getTranslation(key, defaultLocale);
  }
  
  const keys = key.split('.');
  let value: any = localeTranslations;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      console.warn(`Translation key '${key}' not found for locale '${locale}'`);
      return key; // Return key as fallback
    }
  }
  
  if (typeof value === 'string') {
    return value;
  } else if (Array.isArray(value)) {
    return value as any; // Return array for lists
  } else {
    console.warn(`Translation key '${key}' is not a string or array for locale '${locale}'`);
    return key;
  }
}

/**
 * Translation hook for React components
 * @param locale - Current locale
 * @returns Translation function
 */
export function useTranslation(locale: Locale) {
  const t = (key: string): string => getTranslation(key, locale);
  
  const tArray = (key: string): string[] => {
    const value = getTranslation(key, locale);
    return Array.isArray(value) ? value : [value];
  };
  
  return { t, tArray };
}

/**
 * Get available translations for debugging
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string, locale: Locale): boolean {
  try {
    const value = getTranslation(key, locale);
    return value !== key; // If value equals key, translation wasn't found
  } catch {
    return false;
  }
}