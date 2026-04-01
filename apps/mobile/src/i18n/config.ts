import { getLocales, type Locale } from 'expo-localization';
import { I18n } from 'i18n-js';
import { enTranslations } from '@/i18n/locales/en';
import { idTranslations } from '@/i18n/locales/id';
import { uiLogger } from '@/lib/loggers';

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'id'] as const;
const missingTranslationWarnings = new Set<string>();

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
type TranslateOptions = Record<string, unknown>;

interface TranslationTree {
    [key: string]: string | TranslationTree;
}

const translations: Record<SupportedLocale, TranslationTree> = {
    en: {},
    id: {}
};

function syncTranslations() {
    i18n.translations = translations;
}

function isSupportedLocale(value: string): value is SupportedLocale {
    return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

function normalizeLocale(value?: string | null): SupportedLocale | null {
    if (!value) {
        return null;
    }

    const normalizedValue = value.toLowerCase();
    const candidates = [normalizedValue, normalizedValue.split('-')[0]];

    for (const candidate of candidates) {
        if (isSupportedLocale(candidate)) {
            return candidate;
        }
    }

    return null;
}

function lookupTranslationValue(locale: SupportedLocale, key: string): string | undefined {
    const segments = key.split('.');
    let currentValue: string | TranslationTree | undefined = translations[locale];

    for (const segment of segments) {
        if (!currentValue || typeof currentValue === 'string') {
            return undefined;
        }

        currentValue = currentValue[segment];
    }

    return typeof currentValue === 'string' ? currentValue : undefined;
}

function logMissingTranslation(locale: SupportedLocale, key: string, fallbackLocale?: SupportedLocale) {
    const warningKey = `${locale}:${key}:${fallbackLocale ?? 'none'}`;

    if (missingTranslationWarnings.has(warningKey)) {
        return;
    }

    missingTranslationWarnings.add(warningKey);

    if (fallbackLocale) {
        uiLogger.warn(`Missing translation for '${key}' in ${locale}; falling back to ${fallbackLocale}`);
        return;
    }

    uiLogger.warn(`Missing translation for '${key}' in ${locale} and ${DEFAULT_LOCALE}; using key fallback`);
}

export function resolveLocale(locales: Locale[] = getLocales() ?? []): SupportedLocale {
    for (const locale of locales) {
        const candidates = [locale.languageCode, locale.languageTag]
            .filter((candidate): candidate is string => Boolean(candidate))
            .flatMap((candidate) => [candidate, candidate.split('-')[0]])
            .map((candidate) => candidate.toLowerCase());

        for (const candidate of candidates) {
            if (isSupportedLocale(candidate)) {
                return candidate;
            }
        }
    }

    return DEFAULT_LOCALE;
}

export { normalizeLocale };

export function getCurrentLocale(): SupportedLocale {
    return normalizeLocale(i18n.locale) ?? DEFAULT_LOCALE;
}

export function setI18nLocale(locale: SupportedLocale) {
    i18n.locale = locale;
}

export function registerTranslations(nextTranslations: Partial<Record<SupportedLocale, TranslationTree>>) {
    for (const locale of SUPPORTED_LOCALES) {
        const translationTree = nextTranslations[locale];

        if (translationTree) {
            translations[locale] = translationTree;
        }
    }

    syncTranslations();
}

export function resetTranslations() {
    translations.en = {};
    translations.id = {};
    syncTranslations();
}

export function hasTranslation(locale: SupportedLocale, key: string) {
    return lookupTranslationValue(locale, key) !== undefined;
}

export function translate(key: string, options: TranslateOptions = {}) {
    const locale = getCurrentLocale();

    if (hasTranslation(locale, key)) {
        return i18n.t(key, { ...options, locale });
    }

    if (locale !== DEFAULT_LOCALE && hasTranslation(DEFAULT_LOCALE, key)) {
        logMissingTranslation(locale, key, DEFAULT_LOCALE);
        return i18n.t(key, { ...options, locale: DEFAULT_LOCALE });
    }

    logMissingTranslation(locale, key);
    return key;
}

export function resetMissingTranslationWarnings() {
    missingTranslationWarnings.clear();
}

export const i18n = new I18n(translations);

i18n.defaultLocale = DEFAULT_LOCALE;
i18n.enableFallback = true;
i18n.locale = DEFAULT_LOCALE;
registerTranslations({ en: enTranslations, id: idTranslations });
syncTranslations();
setI18nLocale(resolveLocale());

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
export type { SupportedLocale, TranslateOptions, TranslationTree };
