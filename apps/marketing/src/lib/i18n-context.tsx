import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { translations, type Locale, type Translations } from './i18n'

interface I18nContextType {
    locale: Locale
    t: Translations
    setLocale: (locale: Locale) => void
    toggleLocale: () => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children, defaultLocale = 'en' }: { children: ReactNode; defaultLocale?: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale)

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
    }, [])

    const toggleLocale = useCallback(() => {
        setLocaleState((prev) => (prev === 'en' ? 'id' : 'en'))
    }, [])

    const value: I18nContextType = {
        locale,
        t: translations[locale],
        setLocale,
        toggleLocale,
    }

    return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider')
    }
    return context
}
