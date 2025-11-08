import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const rawUser = localStorage.getItem('atgs_user')
    const rawToken = localStorage.getItem('atgs_token')
    if (rawUser) setUser(JSON.parse(rawUser))
    if (rawToken) setToken(rawToken)
  }, [])

  const login = ({ user: u, token: t }) => {
    // u should include at least { name, role, email }
    if (u) {
      setUser(u)
      localStorage.setItem('atgs_user', JSON.stringify(u))
    }
    if (t) {
      setToken(t)
      localStorage.setItem('atgs_token', t)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('atgs_user')
    localStorage.removeItem('atgs_token')
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
