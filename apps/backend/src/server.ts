import { connectDatabase, disconnectDatabase } from "./db"
import app from './index'
import { serverLogger } from '@laughtrack/logger/node'

// Server startup
const PORT = Number(process.env.PORT) ?? 3000

async function startServer() {
    await connectDatabase()

    serverLogger.info(`Server starting on port ${PORT}...`)
    serverLogger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`)

    Bun.serve({
        port: PORT,
        fetch: app.fetch,
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
