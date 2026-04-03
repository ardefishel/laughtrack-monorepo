import { describe, expect, it } from 'vitest'
import { sanitizeRequestUrl } from './logger'

describe('sanitizeRequestUrl', () => {
  it('redacts token query parameters from absolute URLs', () => {
    expect(sanitizeRequestUrl('http://localhost/api/auth/verify-email?token=secret-token&foo=bar')).toBe(
      'http://localhost/api/auth/verify-email?token=%5BREDACTED%5D&foo=bar',
    )
  })

  it('redacts token query parameters from non-URL strings', () => {
    expect(sanitizeRequestUrl('/api/auth/verify-email?token=secret-token')).toBe(
      '/api/auth/verify-email?token=[REDACTED]',
    )
  })
})
