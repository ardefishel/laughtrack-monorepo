import * as React from 'react'
import * as renderer from 'react-test-renderer'
import NoteList from '@/app/(app)/(detail)/note/index'
import type { Setlist } from '@/types'
import { SetlistCard } from '@/features/setlist/components/setlist-card'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mockPush = jest.fn()

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'notes.list.new': 'Baru',
      'notes.list.noMatches': 'Belum ada catatan yang cocok.',
      'notes.list.searchPlaceholder': 'Cari catatan',
      'notes.list.title': 'Catatan',
      'setlist.label': 'Setlist',
      'setlist.untitled': 'Setlist Tanpa Judul',
    }[key] ?? key),
  }),
}))

jest.mock('expo-router', () => ({
  useNavigation: () => ({ setOptions: jest.fn() }),
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}))

jest.mock('@nozbe/watermelondb/react', () => ({
  useDatabase: () => ({}),
}))

jest.mock('@/features/note/hooks/use-note-list', () => ({
  useNoteList: () => ({ notes: [], refresh: jest.fn() }),
}))

jest.mock('@/features/note/services/delete-note', () => ({
  deleteNote: jest.fn(),
}))

jest.mock('@/features/home/components/recent-note-card', () => ({
  RecentNoteCard: () => null,
}))

jest.mock('@/features/material/components/material-card', () => ({
  MaterialCard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('@/lib/time-ago', () => ({
  timeAgo: () => 'just now',
}))

jest.mock('heroui-native', () => ({
  Button: Object.assign(({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>, {
    Label: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }),
  Chip: Object.assign(({ children }: React.PropsWithChildren) => <>{children}</>, {
    Label: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }),
  Input: (props: Record<string, unknown>) => <input {...props} />,
}))

jest.mock('react-native', () => ({
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

describe('shared localization surfaces', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockPush.mockReset()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders a localized empty state for notes list', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<NoteList />)
    })

    const renderedText = tree.root.findAllByType('span').map((node) => node.props.children).join(' ')
    expect(renderedText).toContain('Belum ada catatan yang cocok.')
  })

  it('renders the localized untitled fallback for setlists', async () => {
    const setlist: Setlist = {
      id: 'set-1',
      description: '',
      items: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<SetlistCard setlist={setlist} />)
    })

    const renderedText = tree.root.findAllByType('span').map((node) => node.props.children).join(' ')
    expect(renderedText).toContain('Setlist Tanpa Judul')
  })
})
