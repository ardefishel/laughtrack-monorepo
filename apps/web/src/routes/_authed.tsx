import { authClient, useSession } from '@/lib/auth-client'
import { createFileRoute, Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉', adminOnly: false },
  { to: '/users', label: 'Users', icon: '◎', adminOnly: true },
  { to: '/bits', label: 'Bits', icon: '◈', adminOnly: false },
  { to: '/setlists', label: 'Setlists', icon: '◇', adminOnly: false },
] as const

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    )
  }

  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role
  const isAuthed = !!user
  const isAdmin = !!role && role === 'admin'

  if (!isAuthed) {
    router.navigate({ to: '/login' })
    return null
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar userName={user?.name} userEmail={user?.email} isAdmin={isAdmin} />
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

function Sidebar({ userName, userEmail, isAdmin }: { userName?: string; userEmail?: string; isAdmin: boolean }) {
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
          🎤 <span className="text-warning">Laughtrack</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null
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
