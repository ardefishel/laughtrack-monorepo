import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getUsers } from '@/lib/api'
import { DataTable } from '@/components/DataTable'
import { Pagination } from '@/components/Pagination'
import type { AdminUser } from '@/lib/api'
import type { Column } from '@/components/DataTable'

export const Route = createFileRoute('/users')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    try {
      return await getUsers(deps.page)
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
    render: (user) => <span className="font-medium text-[#f5f5f5]">{user.name}</span>,
  },
  {
    key: 'email',
    label: 'Email',
    render: (user) => (
      <span className="text-[#a1a1aa]" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>
        {user.email}
      </span>
    ),
  },
  {
    key: 'emailVerified',
    label: 'Verified',
    render: (user) => (
      <span className={user.emailVerified ? 'text-[#4ade80]' : 'text-[#71717a]'}>
        {user.emailVerified ? '✓' : '✗'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Joined',
    render: (user) => (
      <span className="text-[#71717a] text-xs">
        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    ),
  },
]

function UsersPage() {
  const { data, pagination } = Route.useLoaderData()
  const navigate = useNavigate()
  const { page } = Route.useSearch()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#f5f5f5] mb-1">Users</h1>
        <p className="text-sm text-[#71717a]">{pagination.total} total users</p>
      </div>

      <DataTable columns={columns} data={data} linkTo={(user) => `/users/${user.id}`} emptyMessage="No users found" />
      <Pagination
        page={page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => navigate({ to: '/users', search: { page: p } })}
      />
    </div>
  )
}
