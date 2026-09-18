import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useAuthStore } from '../store/useAuthStore'

const INPUT = 'w-full px-3 py-2 text-[12.5px] bg-white border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand'
const LABEL = 'block text-[11.5px] font-medium text-ink-muted mb-1.5'

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    await signup({ fullName, email, company, password })
    setLoading(false)
    navigate('/factory-setup')
  }

  return (
    <AuthLayout title="Create your EcoTwin account" subtitle="Mock authentication — password is not stored or validated securely">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL}>Full Name</label>
          <input required className={INPUT} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Priya Sharma" />
        </div>
        <div>
          <label className={LABEL}>Work Email</label>
          <input required type="email" className={INPUT} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div>
          <label className={LABEL}>Company</label>
          <input required className={INPUT} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="VIT Manufacturing" />
        </div>
        <div>
          <label className={LABEL}>Password</label>
          <input required type="password" className={INPUT} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className={LABEL}>Confirm Password</label>
          <input required type="password" className={INPUT} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />} Create Account
        </button>
      </form>
      <p className="text-center text-[12px] text-ink-muted mt-5">
        Already have an account? <Link to="/login" className="text-brand hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  )
}
