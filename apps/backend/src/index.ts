import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorMiddleware } from './middlewares/error'
import { loggerMiddleware } from './middlewares/logger'
import { adminApp } from './routes/admin'
import { authRoutes } from './routes/auth-routes'
import { mobileApp } from './routes/mobile'
import { detect } from './routes/runtime-routes'

const app = new Hono()

// Security headers middleware
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
})

// Global middleware
app.use('*', loggerMiddleware())
app.use('*', errorMiddleware())

// Auth routes need CORS for both mobile and web-admin (shared)
app.use(
  '/api/auth/*',
  cors({
    origin: [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'http://localhost:3001', 'laughtrack://'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount route modules
app.route('/api/auth', authRoutes)
app.route('/api/mobile', mobileApp)
app.route('/api/admin', adminApp)

if (process.env.NODE_ENV === 'development') {
  app.route('/api/detect', detect)
}

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app
