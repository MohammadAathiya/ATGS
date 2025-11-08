import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    timetables: 0,
    faculty: 0,
    courses: 0,
    rooms: 0,
    conflicts: 0,
    utilization: 0
  })

  useEffect(() => {
    // Load statistics from localStorage
    const courses = JSON.parse(localStorage.getItem('atgs_courses') || '[]')
    const faculty = JSON.parse(localStorage.getItem('atgs_faculty') || '[]')
    const classrooms = JSON.parse(localStorage.getItem('atgs_classrooms') || '[]')
    const timetable = JSON.parse(localStorage.getItem('atgs_generated_timetable') || '[]')

    // Calculate utilization
    const totalSlots = 35 // 5 days × 7 hours
    const utilization = classrooms.length > 0 
      ? Math.round((timetable.length / (classrooms.length * totalSlots)) * 100)
      : 0

    setStats({
      timetables: timetable.length > 0 ? 1 : 0,
      faculty: faculty.length,
      courses: courses.length,
      rooms: classrooms.length,
      conflicts: 0,
      utilization
    })
  }, [])

  const cards = [
    { title: 'Total Timetables', value: stats.timetables, icon: '📅', color: 'from-blue-500 to-blue-600', path: '/admin/generator' },
    { title: 'Active Faculty', value: stats.faculty, icon: '👨‍🏫', color: 'from-green-500 to-green-600', path: '/admin/uploads' },
    { title: 'Total Courses', value: stats.courses, icon: '📚', color: 'from-purple-500 to-purple-600', path: '/admin/uploads' },
    { title: 'Available Rooms', value: stats.rooms, icon: '🏫', color: 'from-orange-500 to-orange-600', path: '/admin/uploads' },
    { title: 'Conflicts Resolved', value: stats.conflicts, icon: '✅', color: 'from-red-500 to-red-600', path: '/admin/generator' },
    { title: 'Utilization Rate', value: `${stats.utilization}%`, icon: '📊', color: 'from-teal-500 to-teal-600', path: '/admin/generator' },
  ]

  const quickActions = [
    { 
      title: 'Generate New Timetable', 
      description: 'Create automated timetable for any department', 
      icon: '⚡', 
      color: 'bg-blue-500',
      path: '/admin/generator'
    },
    { 
      title: 'Manage Faculty', 
      description: 'Add, edit, or update faculty information', 
      icon: '👥', 
      color: 'bg-green-500',
      path: '/admin/uploads'
    },
    { 
      title: 'Upload Data', 
      description: 'Import courses, faculty, and rooms via CSV', 
      icon: '📤', 
      color: 'bg-purple-500',
      path: '/admin/uploads'
    },
    { 
      title: 'View Analytics', 
      description: 'Check performance and resource utilization', 
      icon: '📊', 
      color: 'bg-orange-500',
      path: '/admin/generator'
    },
  ]

  const recentActivity = [
    { action: 'Timetable Generated', description: 'New timetable created for Computer Science', time: '2 min ago', icon: '✅', color: 'text-green-600' },
    { action: 'Faculty Updated', description: 'Dr. Smith availability modified, resulting in 3 changes', time: '1 hour ago', icon: '👤', color: 'text-blue-600' },
    { action: 'Conflict Resolved', description: 'Room 301 scheduling conflict resolved for CS-101', time: '3 hours ago', icon: '⚠️', color: 'text-orange-600' },
    { action: 'Course Added', description: 'New course "Machine Learning" added to curriculum', time: '5 hours ago', icon: '📚', color: 'text-purple-600' },
  ]

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Welcome to ATGS Dashboard</h2>
        <p className="text-purple-100">Automated Timetable Generator & Scheduler - Streamline your academic operations with intelligent scheduling</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => navigate(card.path)}
            className="cursor-pointer bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-3xl mb-3 shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            <h3 className="text-gray-600 text-sm font-medium mt-1">{card.title}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                className="cursor-pointer flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center text-2xl text-white flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm">{action.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All Activity →
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className={`text-2xl ${activity.color}`}>{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-800">{activity.action}</h4>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6">System Performance</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="text-4xl mb-2">✓</div>
            <div className="text-3xl font-bold text-green-600">78%</div>
            <div className="text-sm text-gray-600 mt-1">Schedule Efficiency</div>
            <div className="text-xs text-green-600 mt-2">Conflict-free scheduling achieved</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-blue-600">78%</div>
            <div className="text-sm text-gray-600 mt-1">Resource Utilization</div>
            <div className="text-xs text-blue-600 mt-2">Average room utilization rate</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-purple-600">82%</div>
            <div className="text-sm text-gray-600 mt-1">Faculty Workload</div>
            <div className="text-xs text-purple-600 mt-2">Average faculty utilization</div>
          </div>
        </div>
      </div>

      {/* Trends & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Positive Trends</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 text-xl">✓</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Improved scheduling efficiency</p>
                <p className="text-xs text-gray-600 mt-1">Reduced scheduling conflicts by 25%</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-600 text-xl">✓</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Improved room utilization by 12%</p>
                <p className="text-xs text-gray-600 mt-1">Better space management achieved</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Areas for Improvement</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="text-orange-600 text-xl">⚠</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Lab slots need better assignment distribution</p>
                <p className="text-xs text-gray-600 mt-1">Consider spreading lab sessions across the week</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="text-orange-600 text-xl">⚠</div>
              <div>
                <p className="text-sm font-medium text-gray-800">Peak-hour scheduling needs optimization</p>
                <p className="text-xs text-gray-600 mt-1">High demand during 10-12 AM slots</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
