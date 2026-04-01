import { betterAuth } from 'better-auth'
import { expo } from '@better-auth/expo'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { db } from '../db'
import { corsOrigins } from '../lib/cors-origins'
import { users, sessions, accounts, verification } from '../db/schema'
import { createEmailVerificationUrl, getEmailConfig } from '../config/email'
import { createMailer } from '../lib/email/mailer'
import { authLogger, defaultLogger } from '../lib/logger'

function redactEmail(email: string) {
  const [localPart, domain = ''] = email.split('@')
  if (!localPart) return '[REDACTED]'
  const visibleLocalPart = localPart.length <= 2 ? `${localPart[0]}*` : `${localPart.slice(0, 2)}***`
  return `${visibleLocalPart}@${domain}`
}

authLogger.info({
  module: 'auth/index',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  hasAuthUrl: Boolean(process.env.AUTH_URL),
  hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
  hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
}, 'Starting auth module initialization')

authLogger.info({ module: 'auth/index' }, 'Resolving email configuration for auth module')
const emailConfig = getEmailConfig()
authLogger.info({
  module: 'auth/index',
  transport: emailConfig.transport,
  publicWebUrl: emailConfig.publicWebUrl,
  smtpHost: emailConfig.smtp.host,
  smtpPort: emailConfig.smtp.port,
  smtpSecure: emailConfig.smtp.secure,
  hasSmtpUser: Boolean(emailConfig.smtp.user),
  hasSmtpPass: Boolean(emailConfig.smtp.pass),
}, 'Resolved auth email configuration')

authLogger.info({ module: 'auth/index', transport: emailConfig.transport }, 'Creating auth mailer instance')
const mailer = createMailer(emailConfig)
authLogger.info({ module: 'auth/index' }, 'Auth mailer instance created')

authLogger.info({
  module: 'auth/index',
  trustedOriginsCount: corsOrigins.length + 1,
}, 'Creating better-auth instance')
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
      authLogger.info({
        module: 'auth/index',
        userId: user.id,
        email: redactEmail(user.email),
        tokenLength: token.length,
      }, 'Preparing verification email payload')
      const verificationUrl = createEmailVerificationUrl(emailConfig.publicWebUrl, token)
      authLogger.info({
        module: 'auth/index',
        userId: user.id,
        email: redactEmail(user.email),
        verificationUrlHost: new URL(verificationUrl).host,
      }, 'Created verification email URL')
      void mailer.sendVerificationEmail({
        to: user.email,
        verificationUrl,
      }).catch((error) => {
        authLogger.error({
          module: 'auth/index',
          userId: user.id,
          email: redactEmail(user.email),
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        }, 'Verification email queueing failed')
        defaultLogger.error({
          email: redactEmail(user.email),
          errorName: error instanceof Error ? error.name : 'UnknownError',
        }, 'Failed to queue verification email')
      })

      authLogger.info({
        module: 'auth/index',
        userId: user.id,
        email: redactEmail(user.email),
      }, 'Queued verification email send operation')
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

authLogger.info({ module: 'auth/index' }, 'Auth module initialization completed')

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
