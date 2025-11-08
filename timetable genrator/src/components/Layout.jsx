import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navItems = user
    ? user.role === 'Admin'
      ? [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/uploads', label: 'Uploads' },
          { to: '/admin/generator', label: 'Generate' },
          { to: '/admin/conflicts', label: 'Conflicts' },
          { to: '/admin/analytics', label: 'Analytics' },
          { to: '/admin/reports', label: 'Reports' },
        ]
      : user.role === 'Faculty'
      ? [
          { to: '/faculty', label: 'Dashboard' },
          { to: '/faculty/schedule', label: 'Schedule' },
          { to: '/faculty/unavailability', label: 'Unavailability' },
          { to: '/faculty/requests', label: 'Requests' },
          { to: '/faculty/analytics', label: 'Analytics' },
        ]
      : user.role === 'Student'
      ? [
          { to: '/student', label: 'Dashboard' },
          { to: '/student/timetable', label: 'Timetable' },
          { to: '/student/notifications', label: 'Notifications' },
        ]
      : []
    : []

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Sidebar */}
      {user && (
        <aside className="w-64 glass-effect border-r border-white/20 flex flex-col shadow-xl">
          <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-600 to-pink-600">
            <strong className="text-xl text-white font-bold">🎓 ATGS</strong>
            <div className="text-xs text-white/90 mt-1">Role: {user.role}</div>
          </div>
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white/50 hover:shadow-md transition-all duration-200 font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-2 border-t border-white/20">
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-200 font-medium"
            >
              🚪 Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="px-6 py-4 glass-effect border-b border-white/20 flex items-center justify-between shadow-lg">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            🎓 ATGS
          </Link>
          
          {!user ? (
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 font-medium hover:text-purple-600 transition-colors">
                🏠 Home
              </Link>
              <Link to="/about" className="text-gray-700 font-medium hover:text-purple-600 transition-colors">
                ℹ️ About Us
              </Link>
              <Link to="/auth/login" className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg hover:scale-105 transition-all">
                🔑 Sign In
              </Link>
              <Link to="/auth/signup" className="px-6 py-2 rounded-lg border-2 border-purple-600 text-purple-600 font-bold hover:bg-purple-50 hover:scale-105 transition-all">
                ✨ Sign Up
              </Link>
            </nav>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">
                Welcome, <strong className="text-purple-600">{user.role}</strong>
              </span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}