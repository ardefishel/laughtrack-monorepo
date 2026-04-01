import { betterAuth } from 'better-auth'
import { expo } from '@better-auth/expo'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '../db'
import { corsOrigins } from '../lib/cors-origins'
import { users, sessions, accounts, verification } from '../db/schema'
import { createEmailVerificationUrl, getEmailConfig } from '../config/email'
import { createMailer } from '../lib/email/mailer'
import { defaultLogger } from '../lib/logger'

const emailConfig = getEmailConfig()
const mailer = createMailer(emailConfig)

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
  trustedOrigins: ['laughtrack://', ...corsOrigins],
  plugins: [expo(), admin()],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = createEmailVerificationUrl(emailConfig.publicWebUrl, token)
      void mailer.sendVerificationEmail({
        to: user.email,
        verificationUrl,
      }).catch((error) => {
        defaultLogger.error({
          email: user.email,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        }, 'Failed to queue verification email')
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
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
