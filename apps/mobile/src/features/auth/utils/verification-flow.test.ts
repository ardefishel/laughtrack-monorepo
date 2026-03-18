import {
    buildVerifyPendingRoute,
    getResendFeedback,
    getVerifyPendingCopy,
    isUnverifiedEmailFailure,
} from './verification-flow'

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
