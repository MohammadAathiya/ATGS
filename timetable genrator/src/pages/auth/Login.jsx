import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [role, setRole] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      // backend returns { token, user }
      login({ user: data.user, token: data.token })
      // Navigate based on role
      const r = data.user.role || role
      if (r === 'Admin') navigate('/admin', { replace: true })
      else if (r === 'Faculty') navigate('/faculty', { replace: true })
      else navigate('/student', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 p-4">
      <section className="max-w-md w-full space-y-6 glass-effect p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-white/80">Login to your ATGS account</p>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-white text-center">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm text-white font-medium">
            📧 Email
            <input 
              className="border-0 rounded-lg p-3 bg-white/90 text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="grid gap-2 text-sm text-white font-medium">
            🔒 Password
            <input 
              className="border-0 rounded-lg p-3 bg-white/90 text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </label>
          <label className="grid gap-2 text-sm text-white font-medium">
            👤 Role
            <select 
              className="border-0 rounded-lg p-3 bg-white/90 text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option>Admin</option>
              <option>Faculty</option>
              <option>Student</option>
            </select>
          </label>
          <button 
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
            type="submit"
            disabled={loading}
          >
            {loading ? '⏳ Signing In...' : '🚀 Sign In'}
          </button>
          <p className="text-center text-white/80 text-sm">
            Don't have an account? <Link to="/auth/signup" className="text-white font-bold hover:underline">Sign up here</Link>
          </p>
        </form>
      </section>
    </div>
  )
}
