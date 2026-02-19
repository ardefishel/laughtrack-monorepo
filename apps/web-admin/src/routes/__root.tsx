/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { Outlet, createRootRoute, HeadContent, Scripts, Link, useRouterState } from '@tanstack/react-router'
import '@/styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Laughtrack Admin' },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500;600&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/users', label: 'Users', icon: '◎' },
  { to: '/jokes', label: 'Jokes', icon: '◈' },
  { to: '/sets', label: 'Sets', icon: '◇' },
] as const

function RootComponent() {
  return (
    <RootDocument>
      <div
        className="flex min-h-screen bg-[#111116] text-[#e4e4e7]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </RootDocument>
  )
}

function Sidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f13] border-r border-[#1e1e24] flex flex-col">
      <div className="p-6 border-b border-[#1e1e24]">
        <h1 className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
          🎤 <span className="text-[#f59e0b]">Laughtrack</span> Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#f59e0b]/10 text-[#f59e0b]'
                  : 'text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#1e1e24]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1e24]">
        <Link
          to="/login"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#71717a] hover:text-[#e4e4e7] hover:bg-[#1e1e24] transition-colors"
        >
          ⬡ Login
        </Link>
      </div>
    </aside>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#111116] text-[#e4e4e7] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
