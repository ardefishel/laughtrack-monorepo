/// <reference types="vite/client" />
import { authClient, useSession } from '@/lib/auth-client'
import '@/styles.css'
import { createRootRoute, HeadContent, Link, Outlet, Scripts, useRouter, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

const ALLOWED_ROLES = ['admin']

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
      <AuthGate />
    </RootDocument>
  )
}

function AuthGate() {
  const { data: session, isPending } = useSession()
  const routerState = useRouterState()
  const router = useRouter()
  const currentPath = routerState.location.pathname
  const isLoginPage = currentPath === '/login'

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    )
  }

  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role
  const isAuthed = !!user && !!role && ALLOWED_ROLES.includes(role)

  if (isLoginPage) {
    if (isAuthed) {
      router.navigate({ to: '/' })
      return null
    }
    return (
      <div
        className="min-h-screen bg-background text-foreground font-sans"
      >
        <Outlet />
      </div>
    )
  }

  if (!isAuthed) {
    router.navigate({ to: '/login' })
    return null
  }

  return (
    <div
      className="flex min-h-screen bg-background text-foreground font-sans"
    >
      <Sidebar userName={user?.name} userEmail={user?.email} />
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

function Sidebar({ userName, userEmail }: { userName?: string; userEmail?: string }) {
  const routerState = useRouterState()
  const router = useRouter()
  const currentPath = routerState.location.pathname

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          🎤 <span className="text-warning">Laughtrack</span> Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-foreground hover:bg-surface-secondary'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {userName && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm text-foreground font-medium truncate">{userName}</p>
            {userEmail && <p className="text-xs text-muted truncate">{userEmail}</p>}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
        >
          ⬡ Sign out
        </button>
      </div>
    </aside>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
