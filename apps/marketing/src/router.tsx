import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
    const router = createRouter({
        routeTree,
        scrollRestoration: true,
        basepath: import.meta.env.VITE_BASE_PATH || '/',
    })

    return router
}
