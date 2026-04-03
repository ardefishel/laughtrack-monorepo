import { Hono } from 'hono';
import { afterEach, describe, expect, it } from 'vitest';
import { auth } from '../../auth';
import { db } from '../../db';
import { app } from '../../index';
import { requireAdmin, requireAuth } from '../../middlewares/auth';

describe('email verification backend contracts', () => {
  const originalGetSession = auth.api.getSession;
  const originalSelect = db.select;

  afterEach(() => {
    auth.api.getSession = originalGetSession;
    db.select = originalSelect;
  });

  it('blocks an existing unverified credential session from protected routes', async () => {
    auth.api.getSession = (async () => ({
      user: { id: 'user_1', emailVerified: false, role: 'user' },
      session: { id: 'session_1' }
    })) as typeof auth.api.getSession;

    db.select = (() => ({
      from: () => ({
        where: async () => [{ providerId: 'credential' }]
      })
    })) as unknown as typeof db.select;

    const protectedApp = new Hono();
    protectedApp.use('/protected', requireAuth);
    protectedApp.get('/protected', (c) => c.json({ ok: true }));

    const response = await protectedApp.request('/protected');
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Email not verified');
    expect(body.code).toBe('email_not_verified');
  });

  it('allows a verified admin session through admin guards', async () => {
    auth.api.getSession = (async () => ({
      user: { id: 'admin_1', emailVerified: true, role: 'admin' },
      session: { id: 'session_1' }
    })) as typeof auth.api.getSession;

    db.select = (() => ({
      from: () => ({
        where: async () => [{ providerId: 'credential' }]
      })
    })) as unknown as typeof db.select;

    const adminApp = new Hono();
    adminApp.use('/admin', requireAdmin);
    adminApp.get('/admin', (c) => c.json({ ok: true }));

    const response = await adminApp.request('/admin');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it('returns the invalid token contract for a bad verify-email token', async () => {
    const response = await app.request('/api/auth/verify-email?token=invalid-token');
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  });

  it('enables verification-required email sign-in in Better Auth config', () => {
    expect(auth.options.emailAndPassword?.requireEmailVerification).toBe(true);
    expect(auth.options.emailVerification?.sendOnSignIn).toBe(true);
    expect(auth.options.emailVerification?.autoSignInAfterVerification).toBe(false);
  });
});
