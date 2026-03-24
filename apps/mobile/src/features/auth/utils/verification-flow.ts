import { translate } from '@/i18n'

export type VerificationFlowMode = 'signup' | 'signin'

export type AuthActionResult = {
    success: boolean
    error?: string
    status?: number
    code?: string
}

export function buildVerifyPendingRoute(email: string, mode: VerificationFlowMode = 'signup') {
    const trimmedEmail = email.trim()

    return {
        pathname: '/(app)/(auth)/verify-pending' as const,
        params: {
            email: trimmedEmail,
            mode,
        },
    }
}

export function isUnverifiedEmailFailure(result: AuthActionResult) {
    return !result.success && (result.status === 403 || result.code === 'email_not_verified')
}

export function getVerifyPendingCopy(mode: VerificationFlowMode) {
    if (mode === 'signin') {
        return {
            title: translate('auth.verifyPending.signin.title'),
            subtitle: translate('auth.verifyPending.signin.subtitle'),
            body: translate('auth.verifyPending.signin.body'),
        }
    }

    return {
        title: translate('auth.verifyPending.signup.title'),
        subtitle: translate('auth.verifyPending.signup.subtitle'),
        body: translate('auth.verifyPending.signup.body'),
    }
}

export function getResendFeedback(errorMessage?: string) {
    if (errorMessage) {
        return {
            title: translate('auth.verifyPending.resendFailedTitle'),
            message: errorMessage || translate('auth.alerts.tryAgain'),
        }
    }

    return {
        title: translate('auth.verifyPending.resendSuccessTitle'),
        message: translate('auth.verifyPending.resendSuccessMessage'),
    }
}
