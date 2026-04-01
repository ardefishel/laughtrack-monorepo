import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { LanguagePreferenceGroup } from '@/features/account/components/language-preference-group'
import LanguageSelectModal from '@/app/(app)/(modal)/language-select'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const mockReact = React

const mockSetLocale = jest.fn()
const mockPush = jest.fn()
const mockBack = jest.fn()

function MockListItem(props: React.PropsWithChildren<Record<string, unknown>>) {
  return mockReact.createElement('list-item', props, props.children)
}

function MockPressableFeedback(props: React.PropsWithChildren<Record<string, unknown>>) {
  return mockReact.createElement('pressable-feedback', props, props.children)
}

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    locale: 'en',
    setLocale: mockSetLocale,
    t: (key: string) => ({
      'account.language.title': 'Language',
      'account.language.description': 'Choose the language used in the app interface',
      'account.language.english': 'English',
      'account.language.indonesian': 'Bahasa Indonesia',
      'account.language.setting': 'App Language',
      'bitMeta.cancel': 'Cancel',
    }[key] ?? key),
  }),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('react-native', () => ({
  Text: 'Text',
  View: 'View',
}))

jest.mock('heroui-native', () => {
  const Button = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => mockReact.createElement('button', props, children)
  const ButtonLabel = ({ children }: React.PropsWithChildren) => <>{children}</>
  Button.Label = ButtonLabel

  const ListGroup = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => mockReact.createElement('list-group', props, children)
  const ItemPrefix = ({ children }: React.PropsWithChildren) => <>{children}</>
  const ItemContent = ({ children }: React.PropsWithChildren) => <>{children}</>
  const ItemTitle = ({ children }: React.PropsWithChildren) => <>{children}</>
  const ItemSuffix = ({ children }: React.PropsWithChildren) => <>{children}</>

  ListGroup.Item = MockListItem
  ListGroup.ItemPrefix = ItemPrefix
  ListGroup.ItemContent = ItemContent
  ListGroup.ItemTitle = ItemTitle
  ListGroup.ItemSuffix = ItemSuffix

  return {
    Button,
    ListGroup,
    PressableFeedback: MockPressableFeedback,
    Separator: 'Separator',
  }
})

describe('Account language switch', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockSetLocale.mockReset()
    mockPush.mockReset()
    mockBack.mockReset()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders the language settings row with the current locale', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<LanguagePreferenceGroup />)
    })

    const languageItem = tree.root.findByType(MockListItem)
    const englishLabels = tree.root.findAll((node) => String(node.type) === 'Text' && node.props.children === 'English')

    expect(languageItem.props.accessibilityLabel).toBe('App Language')
    expect(languageItem.props.accessibilityHint).toBe('Choose the language used in the app interface')
    expect(englishLabels).toHaveLength(1)
  })

  it('opens the language selection sheet when pressed', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<LanguagePreferenceGroup />)
    })

    const languageItem = tree.root.findByType(MockListItem)

    await act(async () => {
      languageItem.props.onPress()
    })

    expect(mockPush).toHaveBeenCalledWith('/(app)/(modal)/language-select')
  })

  it('updates the locale and closes when Indonesian is selected in the sheet', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<LanguageSelectModal />)
    })

    const option = tree.root.findAllByType(MockPressableFeedback).find((node) => node.props.accessibilityLabel === 'Bahasa Indonesia')

    await act(async () => {
      option?.props.onPress()
    })

    expect(mockSetLocale).toHaveBeenCalledWith('id')
    expect(mockBack).toHaveBeenCalled()
  })
})
