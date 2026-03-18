import { describe, expect, it } from 'bun:test'
import {
  consumeVerificationResendThrottle,
  normalizeEmail,
  resetVerificationResendThrottle,
  verificationResendSuccessResponse,
} from './resend-verification'

describe('resend verification helpers', () => {
  it('normalizes email addresses for privacy-safe throttling', () => {
    expect(normalizeEmail('  User@Example.com ')).toBe('user@example.com')
  })

  it('throttles repeated resend attempts for the same normalized email', () => {
    resetVerificationResendThrottle()

    expect(consumeVerificationResendThrottle('User@Example.com', 0)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    })

    const throttled = consumeVerificationResendThrottle('user@example.com', 15_000)
    expect(throttled.allowed).toBe(false)
    expect(throttled.retryAfterSeconds).toBeGreaterThan(0)

    expect(consumeVerificationResendThrottle('user@example.com', 61_000)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    })
  })

  it('returns a privacy-safe success response body', () => {
    const response = verificationResendSuccessResponse()

    expect(response.success).toBe(true)
    expect(response.status).toBe('ok')
    expect(response.message).toBe('If an account exists, a verification email will be sent shortly.')
    expect(typeof response.timestamp).toBe('string')
  })
})
