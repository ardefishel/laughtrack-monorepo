import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { auth } from '../auth';
import { db } from '../db';
import { resetVerificationResendThrottle } from '../lib/email/resend-verification';
import { authRoutes } from './auth-routes';

describe('auth resend verification route', () => {
  const originalUserFindFirst = db.query.users.findFirst;
  const originalAccountFindFirst = db.query.accounts.findFirst;
  const originalSelect = db.select;
  const originalSendVerificationEmail = auth.api.sendVerificationEmail;

  beforeEach(() => {
    resetVerificationResendThrottle();
  });

  afterEach(() => {
    db.query.users.findFirst = originalUserFindFirst;
    db.query.accounts.findFirst = originalAccountFindFirst;
    db.select = originalSelect;
    Object.defineProperty(auth.api, 'sendVerificationEmail', {
      value: originalSendVerificationEmail,
      configurable: true,
      writable: true
    });
  });

  it('returns the same public response shape for existing and missing accounts', async () => {
    let lookupCount = 0;
    let sendCount = 0;

    db.query.users.findFirst = (async () => {
      lookupCount += 1;
      return lookupCount === 1 ? { id: 'user_1', emailVerified: false } : null;
    }) as typeof db.query.users.findFirst;

    db.select = (() => ({
      from: () => ({
        where: async () => [{ providerId: 'credential' }]
      })
    })) as unknown as typeof db.select;

    Object.defineProperty(auth.api, 'sendVerificationEmail', {
      value: async () => {
        sendCount += 1;
        return { status: true };
      },
      configurable: true,
      writable: true
    });

    const existingResponse = await authRoutes.request('/verification/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'pending@example.com' })
    });

    resetVerificationResendThrottle();

    const missingResponse = await authRoutes.request('/verification/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ghost@example.com' })
    });

    const existingBody = await existingResponse.json();
    const missingBody = await missingResponse.json();

    expect(existingResponse.status).toBe(200);
    expect(missingResponse.status).toBe(200);
    expect(existingBody.success).toBe(true);
    expect(missingBody.success).toBe(true);
    expect(existingBody.status).toBe('ok');
    expect(missingBody.status).toBe('ok');
    expect(existingBody.message).toBe('If an account exists, a verification email will be sent shortly.');
    expect(missingBody.message).toBe('If an account exists, a verification email will be sent shortly.');
    expect(sendCount).toBe(1);
  });

  it('resends for users who have multiple accounts when one is credential', async () => {
    let sendCount = 0;

    db.query.users.findFirst = (async () => ({
      id: 'user_1',
      emailVerified: false
    })) as typeof db.query.users.findFirst;
    db.select = (() => ({
      from: () => ({
        where: async () => [{ providerId: 'google' }, { providerId: 'credential' }]
      })
    })) as unknown as typeof db.select;

    Object.defineProperty(auth.api, 'sendVerificationEmail', {
      value: async () => {
        sendCount += 1;
        return { status: true };
      },
      configurable: true,
      writable: true
    });

    const response = await authRoutes.request('/verification/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'pending@example.com' })
    });

    expect(response.status).toBe(200);
    expect(sendCount).toBe(1);
  });

  it('throttles repeated resend attempts with a stable retry contract', async () => {
    db.query.users.findFirst = (async () => null) as unknown as typeof db.query.users.findFirst;

    const firstResponse = await authRoutes.request('/verification/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'pending@example.com' })
    });

    const secondResponse = await authRoutes.request('/verification/resend', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'pending@example.com' })
    });

    const secondBody = await secondResponse.json();

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.headers.get('Retry-After')).not.toBeNull();
    expect(secondBody.error).toBe('Too many verification email requests. Please wait before trying again.');
    expect(secondBody.code).toBe('verification_resend_throttled');
  });
});
