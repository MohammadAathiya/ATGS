import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoleGuard({ allow }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
