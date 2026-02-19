import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { getJokes } from '@/lib/api'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { StatusBadge } from '@/components/StatusBadge'
import type { AdminJoke } from '@/lib/api'
import type { Column } from '@/components/DataTable'

function formatDate(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const Route = createFileRoute('/jokes')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
    userId: (search.userId as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ page: search.page, userId: search.userId }),
  loader: async ({ deps }) => {
    try {
      return await getJokes(deps.page, 20, deps.userId)
    } catch {
      return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, timestamp: '' }
    }
  },
  component: JokesPage,
})

const columns: Column<AdminJoke>[] = [
  {
    key: 'contentText',
    label: 'Content',
    render: (joke) => (
      <span className="text-[#e4e4e7] max-w-xs truncate block">
        {joke.contentText
          ? joke.contentText.length > 80
            ? joke.contentText.slice(0, 80) + '…'
            : joke.contentText
          : '(empty)'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (joke) => <StatusBadge status={joke.status} />,
  },
  {
    key: 'userName',
    label: 'User',
    render: (joke) => (
      <Link
        to="/users/$id"
        params={{ id: joke.userId }}
        search={{ page: 1 }}
        className="text-[#a1a1aa] hover:text-[#f59e0b] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {joke.userName}
      </Link>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (joke) => <span className="text-[#71717a] text-xs">{formatDate(joke.createdAt)}</span>,
  },
]

function JokesPage() {
  const { data, pagination } = Route.useLoaderData()
  const navigate = useNavigate()
  const { page, userId } = Route.useSearch()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#f5f5f5] mb-1">Jokes</h1>
          <p className="text-sm text-[#71717a]">
            {pagination.total} total jokes{userId ? ' (filtered by user)' : ''}
          </p>
        </div>
        {userId && (
          <button
            onClick={() => navigate({ to: '/jokes', search: { page: 1, userId: undefined } })}
            className="px-3 py-1.5 text-sm rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-[#f59e0b] hover:border-[#f59e0b]/30 transition-colors"
          >
            Clear filter ✕
          </button>
        )}
      </div>

      <DataTable columns={columns} data={data} linkTo={(joke) => `/jokes/${joke.id}`} emptyMessage="No jokes found" />
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => navigate({ to: '/jokes', search: { page: p, userId } })}
      />
    </div>
  )
}
