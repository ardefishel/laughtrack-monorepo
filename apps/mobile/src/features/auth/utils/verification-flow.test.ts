import {
    buildVerifyPendingRoute,
    getResendFeedback,
    getVerifyPendingCopy,
    isUnverifiedEmailFailure,
} from './verification-flow'

jest.mock('@/i18n', () => ({
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

describe('verification flow helpers', () => {
    it('builds the signup verification pending route', () => {
        expect(buildVerifyPendingRoute('pending@example.com', 'signup')).toEqual(
            {
                pathname: '/(app)/(auth)/verify-pending',
                params: {
                    email: 'pending@example.com',
                    mode: 'signup',
                },
            },
        )
    })

    it('trims surrounding whitespace when building the pending route', () => {
        expect(buildVerifyPendingRoute('  pending@example.com  ', 'signup')).toEqual(
            {
                pathname: '/(app)/(auth)/verify-pending',
                params: {
                    email: 'pending@example.com',
                    mode: 'signup',
                },
            },
        )
    })

    it('builds the signin verification pending route', () => {
        expect(buildVerifyPendingRoute('pending@example.com', 'signin')).toEqual(
            {
                pathname: '/(app)/(auth)/verify-pending',
                params: {
                    email: 'pending@example.com',
                    mode: 'signin',
                },
            },
        )
    })

    it('recognizes the backend unverified-email contract', () => {
        expect(isUnverifiedEmailFailure({ success: false, status: 403 })).toBe(true)
        expect(isUnverifiedEmailFailure({ success: false, code: 'email_not_verified' })).toBe(true)
        expect(isUnverifiedEmailFailure({ success: false, status: 422, error: 'Invalid email or password' })).toBe(false)
    })

    it('returns the dedicated signin verification copy', () => {
        expect(getVerifyPendingCopy('signin')).toEqual({
            title: 'Verify Your Email Before Sign In',
            subtitle: 'We still need to confirm your email address',
            body: 'Your account exists, but email verification is still pending. Open the verification email from Laughtrack, then try signing in again.',
        })
    })

    it('returns resend success and failure feedback', () => {
        expect(getResendFeedback()).toEqual({
            title: 'Verification Email Sent',
            message: 'Check your inbox for a fresh verification link.',
        })

        expect(getResendFeedback('Please try again.')).toEqual({
            title: 'Resend Failed',
            message: 'Please try again.',
        })
    })
})
