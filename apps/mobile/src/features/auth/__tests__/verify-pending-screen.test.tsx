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

jest.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => ({
      'auth.alerts.tryAgain': 'Please try again.',
      'auth.verifyPending.backToSignIn': 'Back to Sign In',
      'auth.verifyPending.checkInbox': 'Check your inbox',
      'auth.verifyPending.emailLabel': 'Email',
      'auth.verifyPending.instructions.openEmail': 'Open the verification email from Laughtrack, tap the link, then come back here and sign in.',
      'auth.verifyPending.instructions.spamHint': 'If nothing shows up after a minute, check spam or request a fresh verification email.',
      'auth.verifyPending.missingEmailMessage': 'Go back and create your account again to request a fresh verification email.',
      'auth.verifyPending.missingEmailTitle': 'Missing Email',
      'auth.verifyPending.resendButton': 'Resend Verification Email',
      'auth.verifyPending.resendFailedTitle': 'Resend Failed',
      'auth.verifyPending.resendSending': 'Sending...',
      'auth.verifyPending.resendSuccessMessage': 'Check your inbox for a fresh verification link.',
      'auth.verifyPending.resendSuccessTitle': 'Verification Email Sent',
      'auth.verifyPending.signin.body': 'Your account exists, but email verification is still pending. Open the verification email from Laughtrack, then try signing in again.',
      'auth.verifyPending.signin.subtitle': 'We still need to confirm your email address',
      'auth.verifyPending.signin.title': 'Verify Your Email Before Sign In',
      'auth.verifyPending.signup.body': 'We sent a verification link to finish your account setup.',
      'auth.verifyPending.signup.subtitle': 'One quick step before you can sign in',
      'auth.verifyPending.signup.title': 'Verify Your Email',
      'auth.verifyPending.useRecentAddress': 'Use the address you just signed up with.',
    }[key] ?? key),
  }),
  translate: (key: string) => ({
    'auth.alerts.tryAgain': 'Please try again.',
    'auth.verifyPending.resendFailedTitle': 'Resend Failed',
    'auth.verifyPending.resendSuccessMessage': 'Check your inbox for a fresh verification link.',
    'auth.verifyPending.resendSuccessTitle': 'Verification Email Sent',
    'auth.verifyPending.signin.body': 'Your account exists, but email verification is still pending. Open the verification email from Laughtrack, then try signing in again.',
    'auth.verifyPending.signin.subtitle': 'We still need to confirm your email address',
    'auth.verifyPending.signin.title': 'Verify Your Email Before Sign In',
    'auth.verifyPending.signup.body': 'We sent a verification link to finish your account setup.',
    'auth.verifyPending.signup.subtitle': 'One quick step before you can sign in',
    'auth.verifyPending.signup.title': 'Verify Your Email',
  }[key] ?? key),
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
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    mockReplace.mockReset()
    mockAlert.mockReset()
    mockSendVerificationEmail.mockReset()
    mockAuthContainer.mockReset()
    mockSearchParams.email = 'Pending@Example.com'
    mockSearchParams.mode = 'signin'
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
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
