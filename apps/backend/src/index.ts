import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { connectDatabase, disconnectDatabase } from './db'
import { authRoutes } from './routes/auth-routes'
import { syncRoutes } from './routes/sync-routes'
import { audioRoutes } from './routes/audio-routes'
import { errorMiddleware } from './middlewares/error'
import { loggerMiddleware } from './middlewares/logger'

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
    origin: [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'laughtrack://'],
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

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404)
})

// Server startup
const PORT = Number(process.env.PORT) ?? 3000

async function startServer() {
  await connectDatabase()

  console.log(`Server starting on port ${PORT}...`)
  console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`)

  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  })

  console.log(`Server running at http://localhost:${PORT}`)
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await disconnectDatabase()
  process.exit(0)
})

startServer()
