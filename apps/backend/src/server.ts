import { serve } from '@hono/node-server'
import { connectDatabase, disconnectDatabase } from './db/index'
import { app } from './index'
import { serverLogger } from './lib/logger'

// Server startup
const parsedPort = Number(process.env.PORT)
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000

async function startServer() {
    await connectDatabase()

    serverLogger.info(`Server starting on port ${PORT}...`)
    serverLogger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`)

    serve({
        fetch: app.fetch,
        port: PORT,
        hostname: '0.0.0.0',
    })

    serverLogger.info(`Server running at http://localhost:${PORT}`)
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    serverLogger.info('SIGTERM received, shutting down gracefully...')
    await disconnectDatabase()
    process.exit(0)
})

process.on('SIGINT', async () => {
    serverLogger.info('SIGINT received, shutting down gracefully...')
    await disconnectDatabase()
    process.exit(0)
})

startServer()
