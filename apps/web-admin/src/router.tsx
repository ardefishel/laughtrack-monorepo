import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultNotFoundComponent: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">🎤</p>
          <h1 className="text-xl font-semibold text-[#f5f5f5] mb-2">Page Not Found</h1>
          <p className="text-sm text-[#71717a]">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    ),
  })

  return router
}
