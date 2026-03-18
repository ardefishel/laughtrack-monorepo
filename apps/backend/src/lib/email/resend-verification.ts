const THROTTLE_WINDOW_MS = 60_000
const lastRequestAtByEmail = new Map<string, number>()

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function consumeVerificationResendThrottle(email: string, now = Date.now()) {
  const normalizedEmail = normalizeEmail(email)
  const lastAttemptAt = lastRequestAtByEmail.get(normalizedEmail)

  if (lastAttemptAt !== undefined && now - lastAttemptAt < THROTTLE_WINDOW_MS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((THROTTLE_WINDOW_MS - (now - lastAttemptAt)) / 1000),
    }
  }

  lastRequestAtByEmail.set(normalizedEmail, now)

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

export function resetVerificationResendThrottle() {
  lastRequestAtByEmail.clear()
}

export function verificationResendSuccessResponse() {
  return {
    success: true,
    status: 'ok',
    message: 'If an account exists, a verification email will be sent shortly.',
    timestamp: new Date().toISOString(),
  }
}
