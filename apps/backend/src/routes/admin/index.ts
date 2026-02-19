import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { adminRoutes } from './admin-routes'

const adminApp = new Hono()

// Admin-specific CORS: only allow web-admin origins
adminApp.use(
    '*',
    cors({
        origin: [process.env.CORS_ORIGIN ?? 'http://localhost:3000', 'http://localhost:3001'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
)

adminApp.route('/', adminRoutes)

export { adminApp }
