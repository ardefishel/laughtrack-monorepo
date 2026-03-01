import React, { createContext, useCallback, useContext, type ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'

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
        try {
            const result = await authClient.signIn.email({ email, password })
            if (result.error) {
                return { success: false, error: result.error.message }
            }
            return { success: true }
        } catch (error) {
            console.error('Sign in error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signUp = useCallback(async (email: string, password: string, name: string) => {
        try {
            const result = await authClient.signUp.email({ email, password, name })
            if (result.error) {
                return { success: false, error: result.error.message }
            }
            return { success: true }
        } catch (error) {
            console.error('Sign up error:', error)
            return { success: false, error: 'An unexpected error occurred' }
        }
    }, [])

    const signOut = useCallback(async () => {
        try {
            await authClient.signOut()
        } catch (error) {
            console.error('Sign out error:', error)
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
