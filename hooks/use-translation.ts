import { useHabits } from '@/lib/habit-context';
import { useLanguageInit } from '@/lib/language-init-context';
import frTranslations from '@/lib/i18n/fr.json';
import enTranslations from '@/lib/i18n/en.json';
import itTranslations from '@/lib/i18n/it.json';
import deTranslations from '@/lib/i18n/de.json';
import ruTranslations from '@/lib/i18n/ru.json';
import esTranslations from '@/lib/i18n/es.json';

type TranslationKey = string;

interface Translations {
  [key: string]: any;
}

const translations: Record<string, Translations> = {
  fr: frTranslations,
  en: enTranslations,
  it: itTranslations,
  de: deTranslations,
  ru: ruTranslations,
  es: esTranslations,
};

/**
 * Hook for accessing translations based on the user's language setting
 * Usage: const t = useTranslation(); t('home.title')
 */
export function useTranslation() {
  const { settings } = useHabits();
  const { languageValue } = useLanguageInit();
  const language = languageValue || settings.language || 'fr';

  const t = (key: TranslationKey, params?: Record<string, string>, defaultValue?: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    // Return arrays and objects as-is
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      return value;
    }

    if (typeof value === 'string') {
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => params[paramKey] || `{{${paramKey}}}`);
      }
      return value;
    }

    // Fallback to French if translation not found
    if (language !== 'fr') {
      let fallback: any = translations.fr;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      if (Array.isArray(fallback) || (typeof fallback === 'object' && fallback !== null)) {
        return fallback;
      }
      if (typeof fallback === 'string') {
        if (params) {
          return fallback.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => params[paramKey] || `{{${paramKey}}}`);
        }
        return fallback;
      }
    }

    return defaultValue || key;
  };

  return t;
}
