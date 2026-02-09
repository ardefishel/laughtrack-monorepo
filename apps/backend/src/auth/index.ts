import { betterAuth } from 'better-auth'
import { expo } from '@better-auth/expo'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db'
import { users, sessions, accounts, verification } from '../db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verification,
    },
  }),
  baseURL: process.env.AUTH_URL,
  trustedOrigins: ['laughtrack://'],
  plugins: [expo()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    cookiePrefix: 'backend',
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
