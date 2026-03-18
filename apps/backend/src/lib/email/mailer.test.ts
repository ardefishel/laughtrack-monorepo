import { beforeEach, describe, expect, it } from 'bun:test'
import { getEmailConfig } from '../../config/email'
import { createMailer, getStubEmails, resetStubEmails } from './mailer'

describe('createMailer', () => {
  beforeEach(() => {
    resetStubEmails()
  })

  it('captures verification emails in stub mode', async () => {
    const mailer = createMailer(getEmailConfig({ NODE_ENV: 'test' }))

    const result = await mailer.sendVerificationEmail({
      to: 'verify@example.com',
      verificationUrl: 'https://laughtrack.app/verify-email?token=abc123',
    })

    expect(result.transport).toBe('stub')
    expect(result.messageId).toBe('stub-1')
    expect(getStubEmails()).toEqual([
      {
        to: 'verify@example.com',
        from: 'Laughtrack <no-reply@laughtrack.app>',
        subject: 'Verify your Laughtrack email',
        text: 'Welcome to Laughtrack.\n\nVerify your email by opening this link: https://laughtrack.app/verify-email?token=abc123',
        html: '<p>Welcome to Laughtrack.</p><p><a href="https://laughtrack.app/verify-email?token=abc123">Verify your email</a></p>',
        verificationUrl: 'https://laughtrack.app/verify-email?token=abc123',
      },
    ])
  })

  it('sends through SMTP transport when configured', async () => {
    const sentMessages: Array<Record<string, string>> = []

    const mailer = createMailer(
      getEmailConfig({
        EMAIL_TRANSPORT: 'smtp',
        PUBLIC_WEB_URL: 'https://laughtrack.app',
        SMTP_USER: 'mailer',
        SMTP_PASS: 'secret',
        SMTP_FROM_EMAIL: 'hello@laughtrack.app',
      }),
      () => ({
        sendMail: async (message) => {
          sentMessages.push(message)
          return { messageId: 'smtp-1' }
        },
      }),
    )

    const result = await mailer.sendVerificationEmail({
      to: 'verify@example.com',
      verificationUrl: 'https://laughtrack.app/verify-email?token=abc123',
    })

    expect(result).toEqual({ transport: 'smtp', messageId: 'smtp-1' })
    expect(sentMessages).toEqual([
      {
        from: 'Laughtrack <hello@laughtrack.app>',
        to: 'verify@example.com',
        subject: 'Verify your Laughtrack email',
        text: 'Welcome to Laughtrack.\n\nVerify your email by opening this link: https://laughtrack.app/verify-email?token=abc123',
        html: '<p>Welcome to Laughtrack.</p><p><a href="https://laughtrack.app/verify-email?token=abc123">Verify your email</a></p>',
      },
    ])
  })

  it('hides SMTP secrets when the transport fails', async () => {
    const mailer = createMailer(
      getEmailConfig({
        EMAIL_TRANSPORT: 'smtp',
        PUBLIC_WEB_URL: 'https://laughtrack.app',
        SMTP_USER: 'mailer',
        SMTP_PASS: 'super-secret',
        SMTP_FROM_EMAIL: 'hello@laughtrack.app',
      }),
      () => ({
        sendMail: async () => {
          throw new Error('535 auth failed for super-secret')
        },
      }),
    )

    expect(
      mailer.sendVerificationEmail({
        to: 'verify@example.com',
        verificationUrl: 'https://laughtrack.app/verify-email?token=abc123',
      }),
    ).rejects.toThrow('Failed to send verification email')
  })
})
