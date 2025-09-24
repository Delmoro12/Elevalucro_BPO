export const locales = ['pt-BR', 'pt-PT', 'es', 'en'] as const;
export const defaultLocale = 'pt-BR' as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)', 
  'es': 'Español',
  'en': 'English'
};

export const localeFlags: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  'pt-PT': '🇵🇹',
  'es': '🇪🇸', 
  'en': '🇺🇸'
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}