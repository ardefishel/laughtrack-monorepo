import * as React from 'react'
import * as renderer from 'react-test-renderer'
import TabsLayout from '@/app/(app)/(tabs)/_layout'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const recordedTitles: string[] = []

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'navigation.tabs.account': 'Akun',
      'navigation.tabs.home': 'Beranda',
      'navigation.tabs.learn': 'Belajar',
      'navigation.tabs.material': 'Materi',
    }[key] ?? key),
  }),
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('heroui-native', () => ({
  useThemeColor: () => '#000000',
}))

jest.mock('expo-router', () => {
  const Tabs = ({ children }: React.PropsWithChildren) => <>{children}</>
  const TabsScreen = ({ options }: { options: (args: { route: unknown; navigation: unknown }) => { title: string } }) => {
    recordedTitles.push(options({ route: {}, navigation: {} }).title)
    return null
  }
  TabsScreen.displayName = 'MockTabsScreen'
  Tabs.displayName = 'MockTabs'
  Tabs.Screen = TabsScreen

  return { Tabs }
})

describe('Tabs layout localization', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    recordedTitles.length = 0
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('uses localized tab titles', async () => {
    await act(async () => {
      renderer.create(<TabsLayout />)
    })

    expect(recordedTitles).toEqual(expect.arrayContaining(['Beranda', 'Materi', 'Belajar', 'Akun']))
  })
})
