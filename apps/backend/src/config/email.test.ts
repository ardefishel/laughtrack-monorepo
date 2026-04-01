import { describe, expect, it } from 'bun:test'
import { createEmailVerificationUrl, getEmailConfig } from './email'

describe('getEmailConfig', () => {
  it('uses stub transport defaults in test mode', () => {
    const config = getEmailConfig({ NODE_ENV: 'test' })

    expect(config.transport).toBe('stub')
    expect(config.publicWebUrl).toBe('http://localhost:3001')
    expect(config.smtp.host).toBe('smtp.gmail.com')
    expect(config.smtp.port).toBe(587)
    expect(config.smtp.secure).toBe(false)
    expect(config.smtp.fromName).toBe('Laughtrack')
    expect(config.smtp.fromEmail).toBe('no-reply@laughtrack.app')
  })

  it('defaults to stub transport outside production', () => {
    const config = getEmailConfig({ NODE_ENV: 'development' })

    expect(config.transport).toBe('stub')
  })

  it('defaults to stub transport in production when EMAIL_TRANSPORT is unset', () => {
    const config = getEmailConfig({ NODE_ENV: 'production' })

    expect(config.transport).toBe('stub')
  })

  it('parses explicit SMTP configuration', () => {
    const config = getEmailConfig({
      EMAIL_TRANSPORT: 'smtp',
      PUBLIC_WEB_URL: 'https://laughtrack.app',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'mailer',
      SMTP_PASS: 'secret',
      SMTP_FROM_NAME: 'Laughtrack Mailer',
      SMTP_FROM_EMAIL: 'hello@laughtrack.app',
    })

    expect(config.transport).toBe('smtp')
    expect(config.publicWebUrl).toBe('https://laughtrack.app')
    expect(config.smtp).toEqual({
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      user: 'mailer',
      pass: 'secret',
      fromName: 'Laughtrack Mailer',
      fromEmail: 'hello@laughtrack.app',
    })
  })

  it('fails predictably when SMTP_PASS is missing for smtp transport', () => {
    expect(() =>
      getEmailConfig({
        EMAIL_TRANSPORT: 'smtp',
        PUBLIC_WEB_URL: 'https://laughtrack.app',
        SMTP_USER: 'mailer',
        SMTP_FROM_EMAIL: 'hello@laughtrack.app',
      }),
    ).toThrow('SMTP_PASS is required when EMAIL_TRANSPORT=smtp')
  })

  it('builds the public verify-email URL from the public web host', () => {
    expect(createEmailVerificationUrl('https://laughtrack.app', 'abc123')).toBe(
      'https://laughtrack.app/verify-email?token=abc123',
    )
  })
})
