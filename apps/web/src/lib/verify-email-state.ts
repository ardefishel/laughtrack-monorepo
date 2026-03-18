export type VerificationStatus = 'idle' | 'loading' | 'success' | 'expired' | 'invalid'

export function resolveVerificationStatus(responseOk: boolean, errorCode?: string | null): VerificationStatus {
  if (responseOk) return 'success'
  if (errorCode === 'TOKEN_EXPIRED') return 'expired'
  return 'invalid'
}

export function getVerifyPageState(status: VerificationStatus, hasToken: boolean, queryStatus?: string) {
  if (status === 'success' || queryStatus === 'success') {
    return {
      title: 'Your email is confirmed.',
      body: 'You can sign in now. If you already used this verification link, your email is still verified.',
      tone: 'success' as const,
    }
  }

  if (status === 'expired') {
    return {
      title: 'That verification link expired.',
      body: 'Request a fresh verification email from Laughtrack, then try again from the newest message.',
      tone: 'error' as const,
    }
  }

  if (status === 'invalid' || queryStatus === 'error') {
    return {
      title: 'We could not verify that link.',
      body: 'This verification link is invalid or no longer usable. Request a fresh verification email and try again.',
      tone: 'error' as const,
    }
  }

  return {
    title: hasToken ? 'We are checking your verification link.' : 'Open your verification link to continue.',
    body: hasToken
      ? 'We are talking to Laughtrack now and will show the verification result here in a moment.'
      : 'Once you open the verification email from Laughtrack, this page will finish the confirmation flow.',
    tone: 'loading' as const,
  }
}
