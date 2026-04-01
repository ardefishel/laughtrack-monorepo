import * as renderer from 'react-test-renderer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Locale } from 'expo-localization'
import { registerTranslations, resetMissingTranslationWarnings, resetTranslations, resolveLocale, setI18nLocale, translate } from '@/i18n/config'
import { I18nProvider, useI18n } from '@/i18n/provider'
import { uiLogger } from '@/lib/loggers'

let appStateChangeHandler: ((nextState: 'active' | 'background' | 'inactive') => void) | undefined
let mockLocales: Locale[] = []

const { act } = renderer

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

jest.mock('expo-localization', () => ({
  getLocales: () => mockLocales,
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}))

jest.mock('react-native', () => ({
  AppState: {
    addEventListener: (_event: string, handler: (nextState: 'active' | 'background' | 'inactive') => void) => {
      appStateChangeHandler = handler
      return { remove: jest.fn() }
    },
  },
}))

jest.mock('@/lib/loggers', () => ({
  uiLogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

function createLocale(overrides: Partial<Locale>): Locale {
  return {
    languageTag: 'en-US',
    languageCode: 'en',
    languageScriptCode: 'Latn',
    regionCode: 'US',
    languageRegionCode: 'US',
    currencyCode: 'USD',
    currencySymbol: '$',
    languageCurrencyCode: 'USD',
    languageCurrencySymbol: '$',
    decimalSeparator: '.',
    digitGroupingSeparator: ',',
    textDirection: 'ltr',
    measurementSystem: 'us',
    temperatureUnit: 'fahrenheit',
    ...overrides,
  }
}

describe('i18n bootstrap', () => {
  let consoleErrorSpy: jest.SpyInstance
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockLocales = [createLocale({})]
    appStateChangeHandler = undefined
    resetTranslations()
    resetMissingTranslationWarnings()
    registerTranslations({
      en: {
        common: {
          greeting: 'Hello',
        },
        errors: {
          unexpected: 'Unexpected error',
        },
      },
      id: {
        common: {
          greeting: 'Halo',
        },
      },
    })
    setI18nLocale('en')
    jest.clearAllMocks()
    mockAsyncStorage.getItem.mockResolvedValue(null)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('falls back to English and logs only once for missing locale keys', () => {
    setI18nLocale('id')

    expect(translate('errors.unexpected')).toBe('Unexpected error')
    expect(translate('errors.unexpected')).toBe('Unexpected error')
    expect(uiLogger.warn).toHaveBeenCalledTimes(1)
    expect(uiLogger.warn).toHaveBeenCalledWith("Missing translation for 'errors.unexpected' in id; falling back to en")
  })

  it('rerenders mounted consumers when locale changes', async () => {
    let latestI18n: ReturnType<typeof useI18n> | undefined

    function Probe() {
      latestI18n = useI18n()
      return <>{latestI18n.t('common.greeting')}</>
    }

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    expect(tree.toJSON()).toBe('Hello')

    await act(async () => {
      latestI18n?.setLocale('id')
    })

    expect(tree.toJSON()).toBe('Halo')
  })

  it('prefers the stored locale over the device locale on mount', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('id')

    let latestI18n: ReturnType<typeof useI18n> | undefined

    function Probe() {
      latestI18n = useI18n()
      return <>{latestI18n.t('common.greeting')}</>
    }

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(tree.toJSON()).toBe('Halo')
    expect(mockAsyncStorage.getItem).toHaveBeenCalled()
  })

  it('falls back to English for unsupported device locales', () => {
    expect(resolveLocale([createLocale({ languageTag: 'fr-FR', languageCode: 'fr', regionCode: 'FR', languageRegionCode: 'FR', currencyCode: 'EUR', currencySymbol: '€', languageCurrencyCode: 'EUR', languageCurrencySymbol: '€', measurementSystem: 'metric', temperatureUnit: 'celsius' })])).toBe('en')
  })

  it('hydrates directly to the device locale when no override exists', async () => {
    mockLocales = [createLocale({ languageTag: 'id-ID', languageCode: 'id', regionCode: 'ID', languageRegionCode: 'ID', currencyCode: 'IDR', currencySymbol: 'Rp', languageCurrencyCode: 'IDR', languageCurrencySymbol: 'Rp', measurementSystem: 'metric', temperatureUnit: 'celsius' })]

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(
        <I18nProvider>
          <ProbeMessage />
        </I18nProvider>
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(tree.toJSON()).toBe('Halo')
  })

  it('keeps a stored override when the app resumes with a different device locale', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('en')
    mockLocales = [createLocale({ languageTag: 'id-ID', languageCode: 'id', regionCode: 'ID', languageRegionCode: 'ID', currencyCode: 'IDR', currencySymbol: 'Rp', languageCurrencyCode: 'IDR', languageCurrencySymbol: 'Rp', measurementSystem: 'metric', temperatureUnit: 'celsius' })]

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(
        <I18nProvider>
          <ProbeMessage />
        </I18nProvider>
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(tree.toJSON()).toBe('Hello')

    mockLocales = [createLocale({ languageTag: 'id-ID', languageCode: 'id', regionCode: 'ID', languageRegionCode: 'ID', currencyCode: 'IDR', currencySymbol: 'Rp', languageCurrencyCode: 'IDR', languageCurrencySymbol: 'Rp', measurementSystem: 'metric', temperatureUnit: 'celsius' })]

    await act(async () => {
      appStateChangeHandler?.('active')
    })

    expect(tree.toJSON()).toBe('Hello')
  })
})

function ProbeMessage() {
  const { t } = useI18n()
  return <>{t('common.greeting')}</>
}
