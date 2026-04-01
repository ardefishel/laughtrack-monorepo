import * as React from 'react'
import * as renderer from 'react-test-renderer'
import HomeScreen from '@/app/(app)/(tabs)/home/index'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mockPush = jest.fn()
const mockRecentWorks = [{ id: 'work-1', type: 'bit', title: 'My Untouched Bit' }]
const mockRecentWorkCard = jest.fn()

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'home.noNotes': 'Belum ada catatan. Tulis ide pertama Anda di bawah.',
      'home.recentNotes': 'Catatan Terbaru',
      'home.recentWorks': 'Karya Terbaru',
      'home.seeAll': 'Lihat semua',
    }[key] ?? key),
  }),
}))

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@nozbe/watermelondb/react', () => ({
  useDatabase: () => ({}),
}))

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}))

jest.mock('@/lib/use-keyboard-offset', () => ({
  useKeyboardOffset: () => 0,
}))

jest.mock('@/features/home/hooks/use-recent-works', () => ({
  useRecentWorks: () => mockRecentWorks,
}))

jest.mock('@/features/note/hooks/use-note-list', () => ({
  useNoteList: () => ({ notes: [], refresh: jest.fn() }),
}))

jest.mock('@/features/note/services/note-actions', () => ({
  createNote: jest.fn(),
}))

jest.mock('@/features/note/services/delete-note', () => ({
  deleteNote: jest.fn(),
}))

jest.mock('@/features/home/components/quick-note-bar', () => ({
  QuickNoteBar: () => null,
}))

jest.mock('@/features/home/components/recent-note-card', () => ({
  RecentNoteCard: () => null,
}))

jest.mock('@/features/home/components/recent-work-card', () => ({
  RecentWorkCard: (props: Record<string, unknown>) => {
    mockRecentWorkCard(props)
    return null
  },
}))

jest.mock('react-native', () => ({
  Pressable: 'Pressable',
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

describe('Home localization', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockPush.mockReset()
    mockRecentWorkCard.mockReset()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders localized home chrome and preserves user content', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<HomeScreen />)
    })

    const renderedText = tree.root.findAllByType('span').map((node) => node.props.children).join(' ')

    expect(renderedText).toContain('Karya Terbaru')
    expect(renderedText).toContain('Catatan Terbaru')
    expect(renderedText).toContain('Belum ada catatan. Tulis ide pertama Anda di bawah.')
    expect(mockRecentWorkCard).toHaveBeenCalledWith(expect.objectContaining({ title: 'My Untouched Bit' }))
  })
})
