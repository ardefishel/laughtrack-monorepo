import { connectDatabase, disconnectDatabase } from "./db"
import app from './index'
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
