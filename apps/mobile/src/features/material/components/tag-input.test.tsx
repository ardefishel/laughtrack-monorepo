import * as React from 'react'
import * as renderer from 'react-test-renderer'
import { TagInput } from '@/features/material/components/tag-input'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'tags.addButton': 'Tambahkan tag',
      'tags.addPlaceholder': 'Tambahkan tag...',
    }[key] ?? key),
  }),
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('heroui-native', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <button {...props}>{children}</button>,
  Chip: Object.assign(({ children }: React.PropsWithChildren) => <>{children}</>, {
    Label: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }),
  Input: (props: Record<string, unknown>) => <input {...props} />,
}))

jest.mock('react-native', () => ({
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

describe('TagInput localization', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('localizes the default placeholder and add button accessibility label', async () => {
    let tree!: renderer.ReactTestRenderer

    await act(async () => {
      tree = renderer.create(<TagInput tags={[]} onTagsChange={jest.fn()} />)
    })

    const input = tree.root.findByType('input')
    const button = tree.root.findByType('button')

    expect(input.props.placeholder).toBe('Tambahkan tag...')
    expect(input.props.accessibilityLabel).toBe('Tambahkan tag...')
    expect(button.props.accessibilityLabel).toBe('Tambahkan tag')
  })
})
