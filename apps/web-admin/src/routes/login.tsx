import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🎤</span>
          <h1 className="text-xl font-semibold text-[#f5f5f5] mb-1">Laughtrack Admin</h1>
          <p className="text-sm text-[#71717a]">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Email</label>
            <input
              type="email"
              placeholder="admin@laughtrack.app"
              className="w-full px-3 py-2 bg-[#111116] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#111116] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
          </div>
          <button
            type="button"
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0f0f13] font-medium text-sm rounded-lg transition-colors"
          >
            Sign in
          </button>
        </div>

        <p className="text-xs text-[#52525b] text-center mt-6">Authentication coming soon</p>
      </div>
    </div>
  )
}
