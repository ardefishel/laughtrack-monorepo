import { defaultLogger } from '../logger'
import nodemailer from 'nodemailer'
import { getEmailConfig, type EmailConfig } from '../../config/email'

type VerificationEmailInput = {
  to: string
  verificationUrl: string
}

type SentVerificationEmail = {
  transport: 'smtp' | 'stub'
  messageId: string
}

type StubEmailRecord = {
  to: string
  from: string
  subject: string
  text: string
  html: string
  verificationUrl: string
}

type TransportFactory = (config: EmailConfig) => {
  sendMail: (message: {
    from: string
    to: string
    subject: string
    text: string
    html: string
  }) => Promise<{ messageId?: string | null }>
}

const stubInbox: StubEmailRecord[] = []

function buildMessage(config: EmailConfig, input: VerificationEmailInput) {
  const subject = 'Verify your Laughtrack email'
  const text = [
    'Welcome to Laughtrack.',
    '',
    `Verify your email by opening this link: ${input.verificationUrl}`,
  ].join('\n')
  const html = [
    '<p>Welcome to Laughtrack.</p>',
    `<p><a href="${input.verificationUrl}">Verify your email</a></p>`,
  ].join('')

  return {
    from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
    to: input.to,
    subject,
    text,
    html,
  }
}

function createSmtpTransport(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user ?? undefined,
      pass: config.smtp.pass ?? undefined,
    },
  })
}

export function resetStubEmails() {
  stubInbox.length = 0
}

export function getStubEmails(): StubEmailRecord[] {
  return [...stubInbox]
}

export function createMailer(
  config: EmailConfig = getEmailConfig(),
  createTransport: TransportFactory = createSmtpTransport,
) {
  const transport = config.transport === 'smtp' ? createTransport(config) : null

  return {
    async sendVerificationEmail(input: VerificationEmailInput): Promise<SentVerificationEmail> {
      const message = buildMessage(config, input)

      if (config.transport === 'stub') {
        const messageId = `stub-${stubInbox.length + 1}`
        stubInbox.push({
          to: input.to,
          from: message.from,
          subject: message.subject,
          text: message.text,
          html: message.html,
          verificationUrl: input.verificationUrl,
        })

        return {
          transport: 'stub',
          messageId,
        }
      }

      try {
        const result = await transport!.sendMail(message)

        return {
          transport: 'smtp',
          messageId: result.messageId ?? 'smtp-sent',
        }
      } catch (error) {
        defaultLogger.error({
          transport: config.transport,
          host: config.smtp.host,
          port: config.smtp.port,
          errorName: error instanceof Error ? error.name : 'UnknownError',
        }, 'Failed to send verification email')

        throw new Error('Failed to send verification email')
      }
    },
  }
}
