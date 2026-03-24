import '@/i18n/config';

export { DEFAULT_LOCALE, getCurrentLocale, hasTranslation, i18n, registerTranslations, resetMissingTranslationWarnings, resetTranslations, resolveLocale, setI18nLocale, SUPPORTED_LOCALES, translate } from '@/i18n/config';
export { I18nProvider, useI18n } from '@/i18n/provider';
export { clearStoredLocale, LOCALE_STORAGE_KEY, readStoredLocale, writeStoredLocale } from '@/i18n/storage';
export type { SupportedLocale, TranslateOptions, TranslationTree } from '@/i18n/config';
