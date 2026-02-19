import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { audioRoutes } from './audio-routes'
import { syncRoutes } from './sync-routes'

const mobileApp = new Hono()

// Mobile-specific CORS: only allow the native app deep link origin
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
mobileApp.route('/audio', audioRoutes)

export { mobileApp }
