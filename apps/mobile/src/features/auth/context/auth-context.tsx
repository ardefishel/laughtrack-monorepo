import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import { database } from '@/database'
import { translate } from '@/i18n'
import { authLogger } from '@/lib/loggers'
import { useGoogleSignIn } from '@/features/auth/hooks/use-google-sign-in'

interface AuthUser {
    id: string
    email: string
    name: string
    image?: string | null
}

interface AuthContextType {
    user: AuthUser | null
    isAuthenticated: boolean
    isPending: boolean
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; status?: number; code?: string }>
    signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
    signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeAuthEmail(email: string) {
    return email.trim().toLowerCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const session = authClient.useSession()
    const { signInWithGoogle: googleSignIn } = useGoogleSignIn()

    const user = (session.data?.user as AuthUser) ?? null
    const isAuthenticated = !!user
    const isPending = session.isPending

    const signIn = useCallback(async (email: string, password: string) => {
        authLogger.info('Sign-in attempt')
        const normalizedEmail = normalizeAuthEmail(email)
        try {
            const result = await authClient.signIn.email({ email: normalizedEmail, password })
            if (result.error) {
                authLogger.warn('Sign-in failed:', result.error.message)
                return {
                    success: false,
                    error: result.error.message,
                    status: result.error.status,
                    code: 'code' in result.error ? String(result.error.code) : undefined,
                }
            }
            authLogger.info('Sign-in successful')
            return { success: true }
        } catch (error) {
            authLogger.error('Sign-in unexpected error:', error)
            return { success: false, error: translate('auth.errors.unexpected') }
        }
    }, [])

    const signUp = useCallback(async (email: string, password: string, name: string) => {
        authLogger.info('Sign-up attempt')
        const normalizedEmail = normalizeAuthEmail(email)
        try {
            const result = await authClient.signUp.email({ email: normalizedEmail, password, name })
            if (result.error) {
                authLogger.warn('Sign-up failed:', result.error.message)
                return { success: false, error: result.error.message }
            }
            authLogger.info('Sign-up successful')
            return { success: true }
        } catch (error) {
            authLogger.error('Sign-up unexpected error:', error)
            return { success: false, error: translate('auth.errors.unexpected') }
        }
    }, [])

    const signOut = useCallback(async () => {
        authLogger.info('Sign-out attempt')
        try {
            await database.write(async () => {
                await database.unsafeResetDatabase()
            })
            authLogger.info('Local database cleared on sign-out')
            await authClient.signOut()
            authLogger.info('Sign-out successful')
        } catch (error) {
            authLogger.error('Sign-out error:', error)
        }
    }, [])

    const signInWithGoogle = useCallback(async () => {
        return googleSignIn()
    }, [googleSignIn])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isPending, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
