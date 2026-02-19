import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getUser, updateUser } from '@/lib/api'
import type { UpdateUserPayload } from '@/lib/api'

export const Route = createFileRoute('/users/$id')({
  loader: async ({ params }) => {
    try {
      return await getUser(params.id)
    } catch {
      return { success: false, data: { id: params.id, email: '', name: 'Unknown', image: null, role: 'user', banned: false, banReason: null, emailVerified: false, createdAt: '', jokesCount: 0, setsCount: 0, audioRecordingsCount: 0, tagsCount: 0 }, timestamp: '' }
    }
  },
  component: UserDetailPage,
})

function UserDetailPage() {
  const { data: user } = Route.useLoaderData()
  const router = useRouter()

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [banned, setBanned] = useState(user.banned)
  const [banReason, setBanReason] = useState(user.banReason ?? '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const hasChanges =
    name !== user.name ||
    email !== user.email ||
    role !== user.role ||
    banned !== user.banned ||
    (banned && banReason !== (user.banReason ?? ''))

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      const payload: UpdateUserPayload = {}
      if (name !== user.name) payload.name = name
      if (email !== user.email) payload.email = email
      if (role !== user.role) payload.role = role
      if (banned !== user.banned) payload.banned = banned
      if (banned && banReason !== (user.banReason ?? '')) payload.banReason = banReason || null
      if (!banned && user.banned) payload.banReason = null

      await updateUser(user.id, payload)
      setFeedback({ type: 'success', message: 'User updated successfully.' })
      router.invalidate()
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update user.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/users"
          search={{ page: 1 }}
          className="text-sm text-muted hover:text-accent transition-colors mb-2 inline-block"
        >
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-semibold text-foreground mb-1">{user.name}</h1>
        <p className="text-sm text-muted">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatBlock label="Jokes" value={user.jokesCount} />
        <StatBlock label="Sets" value={user.setsCount} />
        <StatBlock label="Recordings" value={user.audioRecordingsCount} />
        <StatBlock label="Tags" value={user.tagsCount} />
      </div>

      {/* Read-only details */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-dim uppercase tracking-wider mb-4">Details</h2>
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

      {/* Edit form */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-medium text-muted-dim uppercase tracking-wider mb-4">Edit User</h2>
        <div className="space-y-4">
          <FormField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-field-background border border-border rounded-lg text-sm text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-field-background border border-border rounded-lg text-sm text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            />
          </FormField>

          <FormField label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-field-background border border-border rounded-lg text-sm text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </FormField>

          <FormField label="Banned">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBanned(!banned)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-focus ${
                  banned ? 'bg-danger' : 'bg-default'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-foreground shadow ring-0 transition duration-200 ease-in-out ${
                    banned ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm ${banned ? 'text-danger' : 'text-muted'}`}>
                {banned ? 'Banned' : 'Active'}
              </span>
            </div>
          </FormField>

          {banned && (
            <FormField label="Ban Reason">
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Optional reason for ban..."
                className="w-full px-3 py-2 bg-field-background border border-border rounded-lg text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
              />
            </FormField>
          )}
        </div>

        {feedback && (
          <div
            className={`mt-4 px-4 py-2 rounded-lg text-sm ${
              feedback.type === 'success' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to="/jokes"
          search={{ page: 1, userId: user.id }}
          className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition-colors"
        >
          View Jokes →
        </Link>
        <Link
          to="/sets"
          search={{ page: 1, userId: user.id }}
          className="px-4 py-2 text-sm rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition-colors"
        >
          View Sets →
        </Link>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <label className="text-sm text-muted">{label}</label>
      {children}
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-dim uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <dt className="text-sm text-muted">{label}</dt>
      <dd
        className={`text-sm text-foreground ${mono ? 'text-xs' : ''}`}
        style={mono ? { fontFamily: "'JetBrains Mono', monospace" } : undefined}
      >
        {value}
      </dd>
    </div>
  )
}
