type LoggerModule = typeof import('./lib/logger')
type DbModule = typeof import('./db')
type AppModule = { app: typeof import('./index').app }

console.log('[BOOT] Starting backend server entrypoint', JSON.stringify({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  bunVersion: process.versions.bun,
}))

// Server startup
const parsedPort = Number(process.env.PORT)
const PORT = Number.isFinite(parsedPort) ? parsedPort : 3000

async function startServer() {
    console.log('[BOOT] Importing logger module')
    const loggerModule: LoggerModule = await import('./lib/logger.js')
    const { serverLogger } = loggerModule

    serverLogger.info({ module: 'server' }, 'Imported logger module successfully')

    console.log('[BOOT] Importing database module')
    const dbModule: DbModule = await import('./db/index.js')
    const { connectDatabase, disconnectDatabase } = dbModule
    serverLogger.info({ module: 'server' }, 'Imported database module successfully')

    console.log('[BOOT] Importing Hono app module')
    const appModule = await import('./index.js') as AppModule
    const { app } = appModule
    serverLogger.info({ module: 'server' }, 'Imported Hono app module successfully')

    serverLogger.info({ module: 'server' }, 'Connecting database before serving requests')
    await connectDatabase()
    serverLogger.info({ module: 'server' }, 'Database connection check completed')

    serverLogger.info(`Server starting on port ${PORT}...`)
    serverLogger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`)

    Bun.serve({
        port: PORT,
        hostname: '0.0.0.0',
        fetch: app.fetch,
    })

    serverLogger.info(`Server running at http://localhost:${PORT}`)

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
}

startServer().catch((error) => {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { value: String(error) }

    console.error('[BOOT] Backend startup failed', JSON.stringify(errorDetails))
    process.exit(1)
})
