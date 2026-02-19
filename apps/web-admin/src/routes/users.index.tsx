import type { Column } from '@/components/DataTable'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import { SearchBar } from '@/components/SearchBar'
import type { AdminUser } from '@/lib/api'
import { getUsers } from '@/lib/api'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/users/')({
    validateSearch: (search: Record<string, unknown>): {
        page: number
        search?: string
    } => ({
        page: Number(search.page) || 1,
        search: (search.search as string) || undefined,
    }),
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => {
        try {
            return await getUsers(deps.page, 20, deps.search)
        } catch {
            return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, timestamp: '' }
        }
    },
    component: UsersPage,
})

const columns: Column<AdminUser>[] = [
    {
        key: 'name',
        label: 'Name',
        render: (user) => <span className="font-medium text-foreground">{user.name}</span>,
    },
    {
        key: 'email',
        label: 'Email',
        render: (user) => (
            <span className="text-muted" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
                {user.email}
            </span>
        ),
    },
    {
        key: 'role',
        label: 'Role',
        render: (user) => (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    user.role === 'admin' ? 'bg-warning/20 text-warning' : 'bg-surface-secondary text-muted'
                }`}
            >
                {user.role}
            </span>
        ),
    },
    {
        key: 'banned',
        label: 'Status',
        render: (user) => (
            <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    user.banned ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'
                }`}
            >
                {user.banned ? 'Banned' : 'Active'}
            </span>
        ),
    },
    {
        key: 'emailVerified',
        label: 'Verified',
        render: (user) => (
            <span className={user.emailVerified ? 'text-success' : 'text-muted-dim'}>
                {user.emailVerified ? '✓' : '✗'}
            </span>
        ),
    },
    {
        key: 'createdAt',
        label: 'Joined',
        render: (user) => (
            <span className="text-muted text-xs">
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
        ),
    },
]

function UsersPage() {
    const { data, pagination } = Route.useLoaderData()
    const navigate = useNavigate()
    const { page, search } = Route.useSearch()

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">Users</h1>
                    <p className="text-sm text-muted">{pagination.total} total users</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchBar
                        value={search || ''}
                        onChange={(val) => navigate({ search: (prev: any) => ({ ...prev, search: val || undefined, page: 1 }) } as any)}
                        className="w-64"
                    />
                </div>
            </div>

            <DataTable columns={columns} data={data} linkTo={(user) => `/users/${user.id}`} emptyMessage="No users found" />
            <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => navigate({ search: (prev: any) => ({ ...prev, page: p }) } as any)}
            />
        </div>
    )
}
