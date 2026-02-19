import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { webRoutes } from './admin-routes'

const webApp = new Hono()

// Web app CORS: only allow web client origins
webApp.use(
    '*',
    cors({
        origin: [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'http://localhost:3001'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
)

webApp.route('/', webRoutes)

export { webApp }
