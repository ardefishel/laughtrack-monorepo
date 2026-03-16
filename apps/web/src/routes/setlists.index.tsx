import type { Column } from '@/components/DataTable'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { RouteErrorState } from '@/components/RouteErrorState'
import type { Setlist } from '@/lib/api'
import { getSetlists } from '@/lib/api'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

function formatDate(ts: string | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const Route = createFileRoute('/setlists/')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
    userId: (search.userId as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ page: search.page, userId: search.userId }),
  loader: ({ deps }) => getSetlists(deps.page, 20, deps.userId),
  errorComponent: ({ error }) => (
    <RouteErrorState
      title="Setlists unavailable"
      message={error instanceof Error ? error.message : 'Unable to load setlists.'}
      backTo="/"
      backLabel="Back to dashboard"
    />
  ),
  component: SetlistsPage,
})

const columns: Column<Setlist>[] = [
  {
    key: 'description',
    label: 'Description',
    render: (setlist) => <span className="font-medium text-foreground">{setlist.description ?? '(empty)'}</span>,
  },
  {
    key: 'userName',
    label: 'User',
    render: (setlist) => (
      <Link
        to="/users/$id"
        params={{ id: setlist.userId }}
        search={{ page: 1 }}
        className="text-muted hover:text-warning transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {setlist.userName ?? 'Unknown'}
      </Link>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (setlist) => <span className="text-muted text-xs">{formatDate(setlist.createdAt)}</span>,
  },
]

function SetlistsPage() {
  const { data, pagination } = Route.useLoaderData()
  const navigate = useNavigate()
  const { page, userId } = Route.useSearch()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Setlists</h1>
          <p className="text-sm text-muted">
            {pagination.total} total setlists{userId ? ' (filtered by user)' : ''}
          </p>
        </div>
        {userId && (
          <button
            type="button"
            onClick={() => navigate({ to: '/setlists', search: { page: 1, userId: undefined } })}
            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-warning hover:border-warning/30 transition-colors"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      <DataTable columns={columns} data={data} emptyMessage="No setlists found" />
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => navigate({ to: '/setlists', search: { page: p, userId } })}
      />
    </div>
  )
}
