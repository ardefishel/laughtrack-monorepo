import { createFileRoute, Link } from '@tanstack/react-router'
import { getUser } from '@/lib/api'

export const Route = createFileRoute('/users/$id')({
  loader: async ({ params }) => {
    try {
      return await getUser(params.id)
    } catch {
      return { success: false, data: { id: params.id, email: '', name: 'Unknown', image: null, emailVerified: false, createdAt: '', jokesCount: 0, setsCount: 0, audioRecordingsCount: 0, tagsCount: 0 }, timestamp: '' }
    }
  },
  component: UserDetailPage,
})

function UserDetailPage() {
  const { data: user } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/users"
          search={{ page: 1 }}
          className="text-sm text-[#71717a] hover:text-[#f59e0b] transition-colors mb-2 inline-block"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-semibold text-[#f5f5f5] mb-1">{user.name}</h1>
        <p className="text-sm text-[#71717a]">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBlock label="Jokes" value={user.jokesCount} />
        <StatBlock label="Sets" value={user.setsCount} />
        <StatBlock label="Recordings" value={user.audioRecordingsCount} />
        <StatBlock label="Tags" value={user.tagsCount} />
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[#71717a] uppercase tracking-wider mb-4">Details</h2>
        <dl className="space-y-3">
          <DetailRow label="ID" value={user.id} mono />
          <DetailRow label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />
          <DetailRow
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
        </dl>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/jokes"
          search={{ page: 1, userId: user.id }}
          className="px-4 py-2 text-sm rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-[#f59e0b] hover:border-[#f59e0b]/30 transition-colors"
        >
          View Jokes →
        </Link>
        <Link
          to="/sets"
          search={{ page: 1, userId: user.id }}
          className="px-4 py-2 text-sm rounded-lg border border-[#27272a] text-[#a1a1aa] hover:text-[#f59e0b] hover:border-[#f59e0b]/30 transition-colors"
        >
          View Sets →
        </Link>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
      <p className="text-xs text-[#71717a] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#f5f5f5]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <dt className="text-sm text-[#71717a]">{label}</dt>
      <dd
        className={`text-sm text-[#e4e4e7] ${mono ? 'text-xs' : ''}`}
        style={mono ? { fontFamily: "'JetBrains Mono', monospace" } : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
