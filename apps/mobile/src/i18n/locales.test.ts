import { enTranslations } from '@/i18n/locales/en'
import { idTranslations } from '@/i18n/locales/id'

function flattenTranslationKeys(tree: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      return [nextKey]
    }

    return flattenTranslationKeys(value as Record<string, unknown>, nextKey)
  })
}

function getTranslationValue(tree: Record<string, unknown>, key: string) {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current === 'string') {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, tree)
}

describe('localization dictionaries', () => {
  it('keeps English and Indonesian keys in sync', () => {
    expect(flattenTranslationKeys(idTranslations)).toEqual(flattenTranslationKeys(enTranslations))
  })

  it('provides non-empty Indonesian values for representative keys', () => {
    const representativeKeys = [
      'auth.signIn.title',
      'auth.signUp.title',
      'auth.forgotPassword.title',
      'account.language.title',
      'home.recentNotes',
      'navigation.tabs.account',
      'tags.addPlaceholder',
    ]

    for (const key of representativeKeys) {
      expect(getTranslationValue(idTranslations, key)).toEqual(expect.any(String))
      expect((getTranslationValue(idTranslations, key) as string).trim().length).toBeGreaterThan(0)
    }
  })
})
