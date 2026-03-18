import * as React from 'react'
import * as renderer from 'react-test-renderer'
import SignIn from '@/app/(app)/(auth)/sign-in'

const { act } = renderer
;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
const mockReact = React

const mockDismissAll = jest.fn()
const mockReplace = jest.fn()
const mockPush = jest.fn()
const mockAlert = jest.fn()
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ dismissAll: mockDismissAll, replace: mockReplace, push: mockPush }),
}))

jest.mock('@/features/auth/context/auth-context', () => ({
  useAuth: () => ({ signIn: mockSignIn, signInWithGoogle: mockSignInWithGoogle }),
}))

jest.mock('@/features/auth/components/container', () => ({
  AuthContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/ui/ion-icon', () => ({
  Icon: () => null,
}))

jest.mock('react-native', () => ({
  Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
  Pressable: 'Pressable',
  Text: 'Text',
  View: 'View',
}))

jest.mock('heroui-native', () => {
  const Button = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => mockReact.createElement('button', { type: 'button', ...props }, children)
  const ButtonLabel = ({ children }: React.PropsWithChildren) => <>{children}</>
  ;(ButtonLabel as typeof ButtonLabel & { displayName?: string }).displayName = 'MockButtonLabel'
  Button.Label = ButtonLabel
  Button.displayName = 'MockButton'
  const Input = (props: Record<string, unknown>) => mockReact.createElement('input', props)
  Input.displayName = 'MockInput'
  const TextField = ({ children }: React.PropsWithChildren) => <>{children}</>
  TextField.displayName = 'MockTextField'

  return {
    Button,
    Input,
    TextField,
  }
})

describe('SignIn screen', () => {
  beforeEach(() => {
    mockDismissAll.mockReset()
    mockReplace.mockReset()
    mockPush.mockReset()
    mockAlert.mockReset()
    mockSignIn.mockReset()
    mockSignInWithGoogle.mockReset()
  })

  it('routes unverified users into the verify-pending screen', async () => {
    mockSignIn.mockResolvedValue({ success: false, status: 403, code: 'email_not_verified', error: 'Email not verified' })

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(<SignIn />)
    })
    const inputs = tree.root.findAllByType('input')

    await act(async () => {
      inputs[0].props.onChangeText('Pending@Example.com')
      inputs[1].props.onChangeText('Password123!')
    })

    const signInButton = tree.root.findAllByType('button').find((node: { props: { variant?: string } }) => node.props.variant === 'primary')

    await act(async () => {
      await signInButton?.props.onPress()
    })

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/(app)/(auth)/verify-pending',
      params: { email: 'Pending@Example.com', mode: 'signin' },
    })
    expect(mockAlert).not.toHaveBeenCalled()
    expect(mockDismissAll).not.toHaveBeenCalled()
  })

  it('keeps generic wrong-password errors on the alert path', async () => {
    mockSignIn.mockResolvedValue({ success: false, error: 'Invalid email or password', status: 401 })

    let tree!: renderer.ReactTestRenderer
    await act(async () => {
      tree = renderer.create(<SignIn />)
    })
    const inputs = tree.root.findAllByType('input')

    await act(async () => {
      inputs[0].props.onChangeText('verified@example.com')
      inputs[1].props.onChangeText('wrong-pass')
    })

    const signInButton = tree.root.findAllByType('button').find((node: { props: { variant?: string } }) => node.props.variant === 'primary')

    await act(async () => {
      await signInButton?.props.onPress()
    })

    expect(mockAlert).toHaveBeenCalledWith('Sign In Failed', 'Invalid email or password')
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
