import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthGate() {
  const [email, setEmail] = useState('mattlima94@gmail.com')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm fade-in">
        <h1 className="text-2xl font-extrabold mb-1 text-center">Return to Fitness</h1>
        <p className="text-xs text-center mb-8" style={{ opacity: 0.4 }}>
          52-Week Personal Health Tracker
        </p>

        {sent ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(102,187,106,0.08)', border: '1px solid rgba(102,187,106,0.2)' }}>
            <div className="text-3xl mb-3">📧</div>
            <div className="text-sm font-bold mb-1">Check your email</div>
            <div className="text-xs" style={{ opacity: 0.5 }}>
              Magic link sent to <strong>{email}</strong>
            </div>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-xs bg-transparent border-none underline"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ opacity: 0.4 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full py-3 px-3.5 rounded-xl text-sm outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                required
              />
              {error && (
                <div className="text-xs mb-3 px-1" style={{ color: '#EF5350' }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-[14px] border-none text-white text-sm font-bold tracking-wider"
                style={{ background: '#66BB6A', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
