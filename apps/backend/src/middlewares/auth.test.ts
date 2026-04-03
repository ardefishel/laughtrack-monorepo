import { describe, expect, it } from 'vitest'
import { errorResponse } from '../lib/response'
import { EMAIL_NOT_VERIFIED_CODE, requiresVerifiedEmail } from './auth-helpers'

describe('requiresVerifiedEmail', () => {
  it('returns true for unverified credential users', () => {
    expect(
      requiresVerifiedEmail(
        { emailVerified: false } as never,
        ['credential'],
      ),
    ).toBe(true)
  })

  it('returns false for verified credential users', () => {
    expect(
      requiresVerifiedEmail(
        { emailVerified: true } as never,
        ['credential'],
      ),
    ).toBe(false)
  })

  it('returns false for unverified non-credential users', () => {
    expect(
      requiresVerifiedEmail(
        { emailVerified: false } as never,
        ['google'],
      ),
    ).toBe(false)
  })
})

describe('errorResponse', () => {
  it('adds a stable error code when provided', () => {
    const response = errorResponse('Email not verified', undefined, EMAIL_NOT_VERIFIED_CODE)

    expect(response.success).toBe(false)
    expect(response.error).toBe('Email not verified')
    expect(response.code).toBe(EMAIL_NOT_VERIFIED_CODE)
  })
})
