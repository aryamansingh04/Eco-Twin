import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuthStore } from '../store/useAuthStore'

const INPUT = 'w-full px-3 py-2 text-[12.5px] bg-white border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand'
const LABEL = 'block text-[11.5px] font-medium text-ink-muted mb-1.5'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const hasCompletedFactorySetup = useAuthStore((s) => s.hasCompletedFactorySetup)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await login({ email, password })
    setLoading(false)
    navigate(hasCompletedFactorySetup ? '/' : '/factory-setup')
  }

  return (
    <AuthLayout title="Sign in to EcoTwin" subtitle="Mock authentication — for prototype use only">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL}>Work Email</label>
          <input required type="email" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div>
          <label className={LABEL}>Password</label>
          <input required type="password" className={INPUT} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <label className="flex items-center gap-1.5 text-ink-muted">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-brand" />
            Remember Me
          </label>
          <button type="button" className="text-brand hover:underline">Forgot Password?</button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />} Sign In
        </button>
      </form>
      <p className="text-center text-[12px] text-ink-muted mt-5">
        Don't have an account? <Link to="/signup" className="text-brand hover:underline">Sign Up</Link>
      </p>
    </AuthLayout>
  )
}
