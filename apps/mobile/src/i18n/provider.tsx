import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { DEFAULT_LOCALE, resolveLocale, setI18nLocale, translate, type SupportedLocale, type TranslateOptions } from '@/i18n/config';
import { readStoredLocale, writeStoredLocale } from '@/i18n/storage';

interface I18nContextValue {
    locale: SupportedLocale;
    setLocale: (locale: SupportedLocale) => void;
    t: (key: string, options?: TranslateOptions) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: SupportedLocale }) {
    const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale ?? DEFAULT_LOCALE);
    const [hasHydrated, setHasHydrated] = useState(false);
    const [hasStoredOverride, setHasStoredOverride] = useState(false);

    useEffect(() => {
        let isMounted = true;

        void readStoredLocale().then((storedLocale) => {
            if (!isMounted) {
                return;
            }

            if (storedLocale) {
                setHasStoredOverride(true);
                setI18nLocale(storedLocale);
                setLocaleState(storedLocale);
                setHasHydrated(true);
                return;
            }

            const resolvedLocale = initialLocale ?? resolveLocale();
            setI18nLocale(resolvedLocale);
            setLocaleState(resolvedLocale);
            setHasHydrated(true);
        });

        return () => {
            isMounted = false;
        };
    }, [initialLocale]);

    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState !== 'active' || hasStoredOverride) {
                return;
            }

            const resolvedLocale = resolveLocale();

            if (resolvedLocale === locale) {
                return;
            }

            setI18nLocale(resolvedLocale);
            setLocaleState(resolvedLocale);
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [hasStoredOverride, locale]);

    const setLocale = useCallback((nextLocale: SupportedLocale) => {
        setI18nLocale(nextLocale);
        setLocaleState(nextLocale);
        setHasStoredOverride(true);
        void writeStoredLocale(nextLocale);
    }, []);

    const value = useMemo<I18nContextValue>(() => ({
        locale,
        setLocale,
        t: translate,
    }), [locale, setLocale]);

    if (!hasHydrated) {
        return null;
    }

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }

    return context;
}
