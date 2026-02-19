import type { Column } from '@/components/DataTable'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/SearchBar'
import { StatusBadge } from '@/components/StatusBadge'
import type { AdminJoke } from '@/lib/api'
import { getJokes } from '@/lib/api'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

function formatDate(ts: number | null): string {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const Route = createFileRoute('/jokes/')({
    validateSearch: (search: Record<string, unknown>): {
        page: number
        userId?: string
        search?: string
        status?: string
        sort?: string
        order?: 'asc' | 'desc'
    } => ({
        page: Number(search.page) || 1,
        userId: (search.userId as string) || undefined,
        search: (search.search as string) || undefined,
        status: (search.status as string) || undefined,
        sort: (search.sort as string) || undefined,
        order: (search.order as 'asc' | 'desc') || undefined,
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => {
        try {
            return await getJokes(
                deps.page,
                20,
                deps.userId,
                deps.search,
                deps.status,
                deps.sort,
                deps.order
            )
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
        sortable: true,
        render: (joke) => (
            <span className="text-foreground max-w-xs truncate block">
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
        sortable: true,
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
                className="text-muted hover:text-warning transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                {joke.userName}
            </Link>
        ),
    },
    {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (joke) => <span className="text-muted text-xs">{formatDate(joke.createdAt)}</span>,
    },
]

function JokesPage() {
    const { data, pagination } = Route.useLoaderData()
    const navigate = useNavigate()
    const searchParams = Route.useSearch()
    const { page, userId, search, status, sort, order } = searchParams

    const handleSort = (column: string) => {
        const isSameColumn = sort === column
        const newOrder = isSameColumn && order === 'asc' ? 'desc' : 'asc'
        navigate({
            search: (prev: any) => ({ ...prev, sort: column, order: newOrder }),
        } as any)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Jokes</h1>
                    <p className="text-sm text-muted">
                        {pagination.total} total jokes{userId ? ' (filtered by user)' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SearchBar
                        value={search || ''}
                        onChange={(val) => navigate({ search: (prev: any) => ({ ...prev, search: val || undefined, page: 1 }) } as any)}
                        className="w-64"
                    />

                    <select
                        value={status || ''}
                        onChange={(e) => navigate({ search: (prev: any) => ({ ...prev, status: e.target.value || undefined, page: 1 }) } as any)}
                        className="px-3 py-2 bg-field-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                        <option value="performed">Performed</option>
                        <option value="bombed">Bombed</option>
                        <option value="killed">Killed</option>
                    </select>

                    {(userId || search || status) && (
                        <button
                            onClick={() => navigate({ to: '/jokes', search: { page: 1, userId: undefined, search: undefined, status: undefined, sort: undefined, order: undefined } } as any)}
                            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted hover:text-warning hover:border-warning/30 transition-colors whitespace-nowrap"
                        >
                            Clear filters ✕
                        </button>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data}
                linkTo={(joke) => `/jokes/${joke.id}`}
                emptyMessage="No jokes found"
                sortColumn={sort}
                sortDirection={order}
                onSort={handleSort}
            />
            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => navigate({ search: (prev: any) => ({ ...prev, page: p }) } as any)}
            />
        </div>
    )
}
