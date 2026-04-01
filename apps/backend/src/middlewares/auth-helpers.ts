import type { User } from '../auth'

export const EMAIL_NOT_VERIFIED_CODE = 'email_not_verified'

export function requiresVerifiedEmail(user: User, providerIds: string[]) {
  return !user.emailVerified && providerIds.includes('credential')
}
