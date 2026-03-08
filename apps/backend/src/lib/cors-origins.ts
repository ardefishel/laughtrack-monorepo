const DEFAULT_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']

export const corsOrigins: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : DEFAULT_ORIGINS
