import * as React from 'react'
import * as renderer from 'react-test-renderer'
import VerifyPending from '@/app/(app)/(auth)/verify-pending'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const mockReact = React

const mockReplace = jest.fn()
const mockAlert = jest.fn()
const mockSendVerificationEmail = jest.fn()
const mockSearchParams = { email: 'Pending@Example.com', mode: 'signin' }
const mockAuthContainer = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockSearchParams,
}))

jest.mock('@/features/auth/components/container', () => ({
  AuthContainer: ({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) => {
    mockAuthContainer({ title, subtitle })
    return <>{children}</>
  },
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('@/lib/auth-client', () => ({
  authClient: { sendVerificationEmail: mockSendVerificationEmail },
}))

jest.mock('react-native', () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
  Text: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
  View: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

jest.mock('heroui-native', () => {
  const Button = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => mockReact.createElement('button', { type: 'button', ...props }, children)
  const ButtonLabel = ({ children }: React.PropsWithChildren) => <>{children}</>
  ;(ButtonLabel as typeof ButtonLabel & { displayName?: string }).displayName = 'MockButtonLabel'
  Button.Label = ButtonLabel
  Button.displayName = 'MockButton'

  return { Button }
})

describe('VerifyPending screen', () => {
  beforeEach(() => {
    mockReplace.mockReset()
    mockAlert.mockReset()
    mockSendVerificationEmail.mockReset()
    mockAuthContainer.mockReset()
    mockSearchParams.email = 'Pending@Example.com'
    mockSearchParams.mode = 'signin'
  })

  it('renders the dedicated sign-in pending copy', () => {
    let tree!: renderer.ReactTestRenderer
    act(() => {
      tree = renderer.create(<VerifyPending />)
    })
    const textNodes = tree.root.findAllByType('span')
    const renderedText = textNodes.map((node) => node.props.children).join(' ')

    expect(mockAuthContainer).toHaveBeenCalledWith({
      title: 'Verify Your Email Before Sign In',
      subtitle: 'We still need to confirm your email address',
    })
    expect(renderedText).toContain('Your account exists, but email verification is still pending.')
    expect(renderedText).toContain('pending@example.com')
  })

  it('shows resend failure feedback', async () => {
    mockSendVerificationEmail.mockResolvedValue({ error: { message: 'Please try again.' } })

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(<VerifyPending />)
    })
    const resendButton = tree.root.findAllByType('button').find((node: { props: { variant?: string; onPress?: unknown } }) =>
      node.props.variant === 'primary' && typeof node.props.onPress === 'function',
    )

    await act(async () => {
      await resendButton?.props.onPress()
    })

    expect(mockAlert).toHaveBeenCalledWith('Resend Failed', 'Please try again.')
  })
})
