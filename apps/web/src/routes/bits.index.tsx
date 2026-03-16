import type { Column } from '@/components/DataTable'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { RouteErrorState } from '@/components/RouteErrorState'
import { StatusBadge } from '@/components/StatusBadge'
import type { Bit } from '@/lib/api'
import { getBits } from '@/lib/api'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

function formatDate(ts: string | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const Route = createFileRoute('/bits/')({
  validateSearch: (search: Record<string, unknown>): {
    page: number
    userId?: string
  } => ({
    page: Number(search.page) || 1,
    userId: (search.userId as string) || undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getBits(deps.page, 20, deps.userId),
  errorComponent: ({ error }) => (
    <RouteErrorState
      title="Bits unavailable"
      message={error instanceof Error ? error.message : 'Unable to load bits.'}
      backTo="/"
      backLabel="Back to dashboard"
    />
  ),
  component: BitsPage,
})

const columns: Column<Bit>[] = [
  {
    key: 'content',
    label: 'Content',
    render: (bit) => (
      <span className="text-foreground max-w-xs truncate block">
        {(bit.content ?? '(empty)').length > 80 ? `${(bit.content ?? '(empty)').slice(0, 80)}…` : (bit.content ?? '(empty)')}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (bit) => <StatusBadge status={bit.status} />,
  },
  {
    key: 'userName',
    label: 'User',
    render: (bit) => (
      <Link
        to="/users/$id"
        params={{ id: bit.userId }}
        search={{ page: 1 }}
        className="text-muted hover:text-warning transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {bit.userName ?? 'Unknown'}
      </Link>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (bit) => <span className="text-muted text-xs">{formatDate(bit.createdAt)}</span>,
  },
]

function BitsPage() {
  const { data, pagination } = Route.useLoaderData()
  const navigate = useNavigate()
  const { page, userId } = Route.useSearch()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Bits</h1>
          <p className="text-sm text-muted">
            {pagination.total} total bits{userId ? ' (filtered by user)' : ''}
          </p>
        </div>
        {userId && (
          <button
            type="button"
            onClick={() => navigate({ to: '/bits', search: { page: 1, userId: undefined } })}
            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-warning hover:border-warning/30 transition-colors whitespace-nowrap"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No bits found"
      />
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => navigate({ to: '/bits', search: { page: p, userId } })}
      />
    </div>
  )
}
