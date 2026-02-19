import { StatusBadge } from '@/components/StatusBadge'
import { getSet } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'

function formatDate(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const Route = createFileRoute('/sets/$id')({
  loader: async ({ params }) => {
    try {
      return await getSet(params.id)
    } catch {
      return { success: false, data: { id: params.id, title: null, description: null, duration: null, place: null, status: null, userId: '', userName: '', userEmail: '', createdAt: null, updatedAt: null, itemCount: 0, items: [] }, timestamp: '' }
    }
  },
  component: SetDetailPage,
})

function SetDetailPage() {
  const { data: set } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/sets"
          search={{ page: 1, userId: undefined }}
          className="text-sm text-[#71717a] hover:text-[#f59e0b] transition-colors mb-2 inline-block"
        >
          ← Back to Sets
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">{set.title || '(untitled)'}</h1>
          <StatusBadge status={set.status} />
        </div>
        <p className="text-sm text-[#71717a]">
          By{' '}
          <Link to="/users/$id" params={{ id: set.userId }} search={{ page: 1 }} className="text-[#f59e0b] hover:underline">
            {set.userName}
          </Link>
          {' · '}
          {set.userEmail}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-sm font-medium text-[#71717a] uppercase tracking-wider mb-4">Details</h2>
          <dl className="space-y-3">
            <DetailRow label="ID" value={set.id} mono />
            <DetailRow label="Description" value={set.description ?? '—'} />
            <DetailRow label="Place" value={set.place ?? '—'} />
            <DetailRow label="Duration" value={formatDuration(set.duration)} />
            <DetailRow label="Status" value={set.status ?? '—'} />
            <DetailRow label="Items" value={String(set.itemCount)} />
            <DetailRow label="Created" value={formatDate(set.createdAt)} />
            <DetailRow label="Updated" value={formatDate(set.updatedAt)} />
          </dl>
        </div>

        {set.items.length > 0 && (
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-sm font-medium text-[#71717a] uppercase tracking-wider mb-4">
              Set Items ({set.items.length})
            </h2>
            <div className="space-y-2">
              {set.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111116] border border-[#1e1e24]"
                >
                  <span
                    className="text-xs text-[#52525b] w-6 text-right"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {item.position ?? index + 1}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${item.itemType === 'joke' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#3b3b3f] text-[#a1a1aa]'
                      }`}
                  >
                    {item.itemType ?? 'unknown'}
                  </span>
                  {item.itemType === 'joke' && item.jokeId ? (
                    <Link
                      to="/jokes/$id"
                      params={{ id: item.jokeId }}
                      className="text-sm text-[#e4e4e7] flex-1 truncate hover:text-[#f59e0b] transition-colors"
                    >
                      {item.jokeTitle || item.content || '(untitled joke)'}
                    </Link>
                  ) : (
                    <span className="text-sm text-[#e4e4e7] flex-1 truncate">
                      {item.content || '(empty)'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
