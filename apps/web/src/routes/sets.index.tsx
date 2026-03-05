import type { Column } from '@/components/DataTable'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { StatusBadge } from '@/components/StatusBadge'
import type { JokeSet } from '@/lib/api'
import { getSets } from '@/lib/api'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

function formatDate(ts: number | null): string {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDuration(seconds: number | null): string {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const Route = createFileRoute('/sets/')({
    validateSearch: (search: Record<string, unknown>) => ({
        page: Number(search.page) || 1,
        userId: (search.userId as string) || undefined,
    }),
    loaderDeps: ({ search }) => ({ page: search.page, userId: search.userId }),
    loader: async ({ deps }) => {
        try {
            return await getSets(deps.page, 20, deps.userId)
        } catch {
            return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, timestamp: '' }
        }
    },
    component: SetsPage,
})

const columns: Column<JokeSet>[] = [
    {
        key: 'title',
        label: 'Title',
        render: (set) => <span className="font-medium text-foreground">{set.title || '(untitled)'}</span>,
    },
    {
        key: 'status',
        label: 'Status',
        render: (set) => <StatusBadge status={set.status} />,
    },
    {
        key: 'duration',
        label: 'Duration',
        render: (set) => (
            <span className="text-muted" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
                {formatDuration(set.duration)}
            </span>
        ),
    },
    {
        key: 'userName',
        label: 'User',
        render: (set) => (
            <Link
                to="/users/$id"
                params={{ id: set.userId }}
                search={{ page: 1 }}
                className="text-muted hover:text-warning transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {set.userName}
            </Link>
        ),
    },
    {
        key: 'itemCount',
        label: 'Items',
        render: (set) => (
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-muted">
                {set.itemCount}
            </span>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        render: (set) => <span className="text-muted text-xs">{formatDate(set.createdAt)}</span>,
    },
]

function SetsPage() {
    const { data, pagination } = Route.useLoaderData()
    const navigate = useNavigate()
    const { page, userId } = Route.useSearch()

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Sets</h1>
                    <p className="text-sm text-muted">
                        {pagination.total} total sets{userId ? ' (filtered by user)' : ''}
                    </p>
                </div>
                {userId && (
                    <button
                        onClick={() => navigate({ to: '/sets', search: { page: 1, userId: undefined } })}
                        className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-warning hover:border-warning/30 transition-colors"
                    >
                        Clear filter ✕
                    </button>
                )}
            </div>

            <DataTable columns={columns} data={data} linkTo={(set) => `/sets/${set.id}`} emptyMessage="No sets found" />
            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => navigate({ to: '/sets', search: { page: p, userId } })}
            />
        </div>
    )
}
