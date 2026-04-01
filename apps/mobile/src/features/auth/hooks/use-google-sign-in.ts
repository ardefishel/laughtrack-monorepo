import { useCallback } from 'react'
import { Platform } from 'react-native'
import { GoogleSignin, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin'
import { translate } from '@/i18n'
import { authClient } from '@/lib/auth-client'
import { authLogger } from '@/lib/loggers'

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
})

type GoogleSignInResult = {
    success: boolean
    error?: string
}

function getStringProperty(value: unknown, key: string): string | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined
    }

    const property = (value as Record<string, unknown>)[key]
    return typeof property === 'string' ? property : undefined
}

export function useGoogleSignIn() {
    const signInWithGoogle = useCallback(async (): Promise<GoogleSignInResult> => {
        try {
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
            }

            const response = await GoogleSignin.signIn()
            if (!isSuccessResponse(response)) {
                return { success: false, error: translate('auth.errors.googlePopupCancelled') }
            }

            const idToken = response.data?.idToken
            if (!idToken) {
                authLogger.error('Google sign-in returned no ID token')
                return { success: false, error: translate('auth.errors.googleIdToken') }
            }

            const result = await authClient.signIn.social({
                provider: 'google',
                idToken: { token: idToken },
            })

            if (result.error) {
                authLogger.warn('Google sign-in failed:', result.error.message)
                return { success: false, error: result.error.message }
            }

            authLogger.info('Google sign-in successful')
            return { success: true }
        } catch (error: unknown) {
            authLogger.error('Google sign-in unexpected error:', error)

            const errorCode = getStringProperty(error, 'code')
            const isEmptyObject =
                typeof error === 'object' && error !== null && Object.keys(error).length === 0
            const errorMessage =
                getStringProperty(error, 'message') ??
                (error instanceof Error ? error.message : translate('auth.errors.unexpected'))

            if (errorCode === statusCodes.SIGN_IN_CANCELLED || isEmptyObject) {
                return { success: false, error: translate('auth.errors.googleCancelled') }
            }

            if (errorCode === statusCodes.IN_PROGRESS) {
                return { success: false, error: translate('auth.errors.googleInProgress') }
            }

            if (errorCode === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                return { success: false, error: translate('auth.errors.googlePlayServicesUnavailable') }
            }

            return { success: false, error: errorMessage }
        }
    }, [])

    return { signInWithGoogle }
}
