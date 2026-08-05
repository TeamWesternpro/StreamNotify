import { useState } from 'react'
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = onLogin(username.trim(), password)
    if (!ok) {
      setError('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15161c] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-purple-500 to-cyan-400 shadow-lg">
            <Lock size={26} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-gray-400">
            Sign in to manage your stream cards
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Username
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
              <User size={16} className="text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
              <Lock size={16} className="text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-white placeholder-gray-600 outline-none"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-gray-500 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 via-purple-500 to-cyan-400 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn size={16} />
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
