import { authClient } from '@/lib/auth-client'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_public/login')({
  component: Login,
})



function Login() {
  const router = useRouter()
  const publicVerifyUrl = '/verify-email?status=error'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'generic' | 'unverified'>('generic')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
      })

      if (signInError) {
        const isUnverified = signInError.status === 403
        setErrorType(isUnverified ? 'unverified' : 'generic')
        setError(isUnverified ? 'Please verify your email before signing in.' : signInError.message || 'Invalid email or password')
        setLoading(false)
        return
      }

      router.navigate({ to: '/' })
    } catch {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🎤</span>
          <h1 className="text-xl font-semibold text-[#f5f5f5] mb-1">Laughtrack</h1>
          <p className="text-sm text-[#71717a]">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <p>{error}</p>
              {errorType === 'unverified' ? (
                <a
                  href={publicVerifyUrl}
                  className="mt-2 inline-flex text-xs font-medium text-[#f59e0b] hover:text-[#fbbf24]"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open the verification page or request a new link
                </a>
              ) : null}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 bg-[#111116] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 bg-[#111116] border border-[#27272a] rounded-lg text-sm text-[#e4e4e7] placeholder-[#52525b] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-[#0f0f13] font-medium text-sm rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
