import { useCallback } from 'react'
import { authClient } from '@/lib/auth-client'
import { authLogger } from '@/lib/loggers'

type GoogleSignInResult = {
    success: boolean
    error?: string
}

export function useGoogleSignIn() {
    const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
        try {
            const result = await authClient.signIn.social({ provider: 'google' })

            if (result.error) {
                authLogger.warn('Google sign-in failed:', result.error.message)
                return { success: false, error: result.error.message }
            }

            return { success: true }
        } catch (error) {
            authLogger.error('Google sign-in unexpected error:', error)
            return { success: false, error: 'Failed to sign in with Google' }
        }
    }, [])

    return { signInWithGoogle }
}
