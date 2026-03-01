import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { syncRoutes } from './sync-routes'

const mobileApp = new Hono()

mobileApp.use(
    '*',
    cors({
        origin: ['laughtrack://'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
)

mobileApp.route('/sync', syncRoutes)

export { mobileApp }
