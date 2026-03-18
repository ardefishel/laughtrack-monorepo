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
            title: 'Verify Your Email Before Sign In',
            subtitle: 'We still need to confirm your email address',
            body: 'Your account exists, but email verification is still pending. Open the verification email from Laughtrack, then try signing in again.',
        }
    }

    return {
        title: 'Verify Your Email',
        subtitle: 'One quick step before you can sign in',
        body: 'We sent a verification link to finish your account setup.',
    }
}

export function getResendFeedback(errorMessage?: string) {
    if (errorMessage) {
        return {
            title: 'Resend Failed',
            message: errorMessage || 'Please try again.',
        }
    }

    return {
        title: 'Verification Email Sent',
        message: 'Check your inbox for a fresh verification link.',
    }
}
