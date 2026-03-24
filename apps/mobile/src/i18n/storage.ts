import AsyncStorage from '@react-native-async-storage/async-storage';
import { uiLogger } from '@/lib/loggers';
import { normalizeLocale, type SupportedLocale } from '@/i18n/config';

const LOCALE_STORAGE_KEY = 'laughtrack.locale';

export async function readStoredLocale() {
    try {
        const value = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        return normalizeLocale(value);
    } catch (error) {
        uiLogger.error('Failed to read stored locale preference', error);
        return null;
    }
}

export async function writeStoredLocale(locale: SupportedLocale) {
    try {
        await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (error) {
        uiLogger.error('Failed to store locale preference', error);
    }
}

export async function clearStoredLocale() {
    try {
        await AsyncStorage.removeItem(LOCALE_STORAGE_KEY);
    } catch (error) {
        uiLogger.error('Failed to clear locale preference', error);
    }
}

export { LOCALE_STORAGE_KEY };
