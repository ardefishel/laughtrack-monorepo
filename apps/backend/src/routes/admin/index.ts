import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { corsOrigins } from '../../lib/cors-origins'
import { webRoutes } from './admin-routes'

const webApp = new Hono()

// Web app CORS: only allow web client origins
webApp.use(
    '*',
    cors({
        origin: corsOrigins,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
)

webApp.route('/', webRoutes)

export { webApp }
