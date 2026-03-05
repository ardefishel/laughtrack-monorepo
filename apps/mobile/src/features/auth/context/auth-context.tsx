import React, { createContext, useCallback, useContext, type ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'
import { authLogger } from '@/lib/loggers'

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
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const session = authClient.useSession()

    const user = (session.data?.user as AuthUser) ?? null
    const isAuthenticated = !!user
    const isPending = session.isPending

    const signIn = useCallback(async (email: string, password: string) => {
        authLogger.info('Sign-in attempt')
        try {
            const result = await authClient.signIn.email({ email, password })
            if (result.error) {
                authLogger.warn('Sign-in failed:', result.error.message)
                return { success: false, error: result.error.message }
            }
            authLogger.info('Sign-in successful')
            return { success: true }
        } catch (error) {
            authLogger.error('Sign-in unexpected error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signUp = useCallback(async (email: string, password: string, name: string) => {
        authLogger.info('Sign-up attempt')
        try {
            const result = await authClient.signUp.email({ email, password, name })
            if (result.error) {
                authLogger.warn('Sign-up failed:', result.error.message)
                return { success: false, error: result.error.message }
            }
            authLogger.info('Sign-up successful')
            return { success: true }
        } catch (error) {
            authLogger.error('Sign-up unexpected error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signOut = useCallback(async () => {
        authLogger.info('Sign-out attempt')
        try {
            await authClient.signOut()
            authLogger.info('Sign-out successful')
        } catch (error) {
            authLogger.error('Sign-out error:', error)
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isPending, signIn, signUp, signOut }}>
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
