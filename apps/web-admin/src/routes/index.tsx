import { StatsCard } from '@/components/StatsCard'
import type { AdminStats } from '@/lib/api'
import { getStats } from '@/lib/api'
import { createFileRoute } from '@tanstack/react-router'

const defaultStats: AdminStats = { users: 0, jokes: 0, sets: 0, audioRecordings: 0, tags: 0 }

export const Route = createFileRoute('/')({
  loader: async () => {
    try {
      return await getStats()
    } catch {
      return defaultStats
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const stats = Route.useLoaderData()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted">Overview of your Laughtrack platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard label="Users" value={stats.users} icon="👤" />
        <StatsCard label="Jokes" value={stats.jokes} icon="😂" />
        <StatsCard label="Sets" value={stats.sets} icon="📋" />
        <StatsCard label="Recordings" value={stats.audioRecordings} icon="🎙️" />
        <StatsCard label="Tags" value={stats.tags} icon="🏷️" />
      </div>
    </div>
  )
}
