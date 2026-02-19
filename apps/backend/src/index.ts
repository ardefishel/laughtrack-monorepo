import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorMiddleware } from './middlewares/error'
import { loggerMiddleware } from './middlewares/logger'
import { authRoutes } from './routes/auth-routes'
import { audioRoutes } from './routes/audio-routes'
import { adminRoutes } from './routes/admin-routes'
import { detect } from './routes/runtime-routes'
import { syncRoutes } from './routes/sync-routes'

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
app.use(
  '*',
  cors({
    origin: [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'http://localhost:3001', 'laughtrack://'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)
app.use('*', errorMiddleware())

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount route modules
app.route('/api/auth', authRoutes)
app.route('/api/sync', syncRoutes)
app.route('/api/audio', audioRoutes)
app.route('/api/admin', adminRoutes)

if (process.env.NODE_ENV === 'development') {
  app.route('/api/detect', detect)
}

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

export default app
