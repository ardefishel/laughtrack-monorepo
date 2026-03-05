import { createFileRoute, Link } from '@tanstack/react-router'
import { getJoke } from '@/lib/api'
import { StatusBadge } from '@/components/StatusBadge'

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

export const Route = createFileRoute('/jokes/$id')({
  loader: async ({ params }) => {
    try {
      return await getJoke(params.id)
    } catch {
      return { success: false, data: { id: params.id, contentText: null, contentHtml: null, status: null, userId: '', userName: '', userEmail: '', createdAt: null, updatedAt: null, draftUpdatedAt: null, tags: null }, timestamp: '' }
    }
  },
  component: JokeDetailPage,
})

function JokeDetailPage() {
  const { data: joke } = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/jokes"
          search={{ page: 1, userId: undefined }}
          className="text-sm text-[#71717a] hover:text-[#f59e0b] transition-colors mb-2 inline-block"
        >
          ← Back to Jokes
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-[#f5f5f5]">Joke Detail</h1>
          <StatusBadge status={joke.status} />
        </div>
        <p className="text-sm text-[#71717a]">
          By{' '}
          <Link to="/users/$id" params={{ id: joke.userId }} search={{ page: 1 }} className="text-[#f59e0b] hover:underline">
            {joke.userName}
          </Link>
          {' · '}
          {joke.userEmail}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-sm font-medium text-[#71717a] uppercase tracking-wider mb-4">Content</h2>
          {joke.contentHtml ? (
            <div
              className="prose prose-invert prose-sm max-w-none text-[#e4e4e7]"
              dangerouslySetInnerHTML={{ __html: joke.contentHtml }}
            />
          ) : joke.contentText ? (
            <p className="text-sm text-[#e4e4e7] whitespace-pre-wrap">{joke.contentText}</p>
          ) : (
            <p className="text-sm text-[#52525b] italic">No content</p>
          )}
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-sm font-medium text-[#71717a] uppercase tracking-wider mb-4">Metadata</h2>
          <dl className="space-y-3">
            <DetailRow label="ID" value={joke.id} mono />
            <DetailRow label="Status" value={joke.status ?? '—'} />
            <DetailRow label="Tags" value={joke.tags ?? '—'} />
            <DetailRow label="Created" value={formatDate(joke.createdAt)} />
            <DetailRow label="Updated" value={formatDate(joke.updatedAt)} />
            <DetailRow label="Draft Updated" value={formatDate(joke.draftUpdatedAt)} />
          </dl>
        </div>
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
