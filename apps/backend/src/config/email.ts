const DEFAULT_PUBLIC_WEB_URL = 'http://localhost:3001'
const DEFAULT_SMTP_HOST = 'smtp.gmail.com'
const DEFAULT_SMTP_PORT = 587

const trueValues = new Set(['1', 'true', 'yes', 'on'])
const falseValues = new Set(['0', 'false', 'no', 'off'])

export type EmailTransportMode = 'smtp' | 'stub'

export type EmailConfig = {
  publicWebUrl: string
  transport: EmailTransportMode
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string | null
    pass: string | null
    fromName: string
    fromEmail: string
  }
}

export function createEmailVerificationUrl(publicWebUrl: string, token: string): string {
  const url = new URL('/verify-email', publicWebUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === '') return fallback

  const normalized = value.trim().toLowerCase()
  if (trueValues.has(normalized)) return true
  if (falseValues.has(normalized)) return false

  throw new Error(`Invalid boolean value: ${value}`)
}

function normalizeOptional(value: string | undefined): string | null {
  if (value == null) return null

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function getEmailConfig(env: NodeJS.ProcessEnv = process.env): EmailConfig {
  const transport = (env.EMAIL_TRANSPORT?.trim().toLowerCase() ?? (env.NODE_ENV === 'production' ? 'smtp' : 'stub')) as EmailTransportMode


  if (transport !== 'smtp' && transport !== 'stub') {
    throw new Error(`EMAIL_TRANSPORT must be either "smtp" or "stub". Received: ${env.EMAIL_TRANSPORT}`)
  }

  const smtpPortValue = env.SMTP_PORT?.trim() || String(DEFAULT_SMTP_PORT)
  const smtpPort = Number(smtpPortValue)

  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error(`SMTP_PORT must be a positive number. Received: ${env.SMTP_PORT}`)
  }

  const config = {
    publicWebUrl: env.PUBLIC_WEB_URL?.trim() || DEFAULT_PUBLIC_WEB_URL,
    transport,
    smtp: {
      host: env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST,
      port: smtpPort,
      secure: parseBoolean(env.SMTP_SECURE, false),
      user: normalizeOptional(env.SMTP_USER),
      pass: normalizeOptional(env.SMTP_PASS),
      fromName: env.SMTP_FROM_NAME?.trim() || 'Laughtrack',
      fromEmail: env.SMTP_FROM_EMAIL?.trim() || 'no-reply@laughtrack.app',
    },
  } satisfies EmailConfig

  const requiredForSmtp = [
    ['SMTP_USER', config.smtp.user],
    ['SMTP_PASS', config.smtp.pass],
    ['SMTP_FROM_EMAIL', config.smtp.fromEmail],
    ['PUBLIC_WEB_URL', config.publicWebUrl],
  ] as const

  if (transport === 'smtp') {
    const missingKey = requiredForSmtp.find(([, value]) => value == null || value === '')?.[0]
    if (missingKey) {
      throw new Error(`${missingKey} is required when EMAIL_TRANSPORT=smtp`)
    }
  }

  return config
}
