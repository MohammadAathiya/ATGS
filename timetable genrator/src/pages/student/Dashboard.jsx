import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [todayClasses, setTodayClasses] = useState([])
  const [studentInfo] = useState({
    name: 'Rajesh Mehta',
    rollNo: 'CS-2023-001',
    department: 'Computer Science',
    semester: '5',
    section: 'A',
    gpa: '8.5'
  })

  useEffect(() => {
    const timetable = JSON.parse(localStorage.getItem('atgs_generated_timetable') || '[]')
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todaySchedule = timetable
      .filter(entry => entry.day === today)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
    setTodayClasses(todaySchedule)
  }, [])

  return (
    <section className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Student Portal</h2>
        <p className="text-purple-100">Access your timetable, register for courses, and manage your academic profile</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              RM
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{studentInfo.name}</h3>
              <p className="text-gray-600">{studentInfo.rollNo} | {studentInfo.department} - Semester {studentInfo.semester}</p>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span className="text-sm text-gray-600">Department: <span className="font-medium">{studentInfo.department}</span></span>
                <span className="text-sm text-gray-600">Semester: <span className="font-medium">{studentInfo.semester}</span></span>
                <span className="text-sm text-gray-600">Section: <span className="font-medium">{studentInfo.section}</span></span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { label: 'GPA', value: studentInfo.gpa, icon: '📊', color: 'bg-blue-500' },
              { label: 'Courses', value: '8', icon: '📚', color: 'bg-green-500' },
              { label: 'Credits', value: '24', icon: '🎓', color: 'bg-purple-500' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg min-w-[80px]">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { title: 'My Timetable', icon: '📅', path: '/student/timetable', color: 'from-blue-500 to-blue-600' },
          { title: 'Course Registration', icon: '📝', path: '/student/timetable', color: 'from-green-500 to-green-600' },
          { title: 'Student Profile', icon: '👤', path: '/student/notifications', color: 'from-purple-500 to-purple-600' },
          { title: 'Notifications', icon: '🔔', path: '/student/notifications', color: 'from-orange-500 to-orange-600', badge: '3' }
        ].map((action, idx) => (
          <div key={idx} onClick={() => navigate(action.path)} className="cursor-pointer bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-200 hover:scale-105 relative">
            {action.badge && <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{action.badge}</span>}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-2xl mb-3`}>{action.icon}</div>
            <h3 className="font-bold text-gray-800">{action.title}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Today's Schedule</h3>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={() => navigate('/student/timetable')} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            View Full Timetable
          </button>
        </div>

        {todayClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">No Classes Today</h4>
            <p className="text-gray-600">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-pink-100">
                  <th className="border border-purple-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Time</th>
                  <th className="border border-purple-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Course Code</th>
                  <th className="border border-purple-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Course Name</th>
                  <th className="border border-purple-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Faculty</th>
                  <th className="border border-purple-200 px-4 py-3 text-left text-sm font-bold text-gray-700">Room</th>
                </tr>
              </thead>
              <tbody>
                {todayClasses.map((cls, idx) => (
                  <tr key={idx} className="hover:bg-purple-50 transition-colors">
                    <td className="border border-purple-200 px-4 py-3 text-sm">{new Date(cls.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="border border-purple-200 px-4 py-3 text-sm font-medium text-purple-600">{cls.courseCode}</td>
                    <td className="border border-purple-200 px-4 py-3 text-sm">{cls.course}</td>
                    <td className="border border-purple-200 px-4 py-3 text-sm">{cls.faculty}</td>
                    <td className="border border-purple-200 px-4 py-3 text-sm">{cls.classroom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'Schedule Alerts', desc: 'Get notified about schedule changes', icon: '🔔', color: 'blue', btn: 'Manage Alerts' },
          { title: 'Add to Calendar', desc: 'Sync with your preferred calendar', icon: '📅', color: 'green', btn: 'Export Calendar' },
          { title: 'Share Schedule', desc: 'Share your timetable with friends', icon: '📤', color: 'purple', btn: 'Share Link' }
        ].map((action, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer text-center">
            <div className={`w-16 h-16 rounded-full bg-${action.color}-100 flex items-center justify-center text-3xl mx-auto mb-3`}>{action.icon}</div>
            <h4 className="font-bold text-gray-800 mb-2">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.desc}</p>
            <button className={`mt-4 px-4 py-2 bg-${action.color}-500 text-white rounded-lg hover:bg-${action.color}-600 transition-colors text-sm`}>{action.btn}</button>
          </div>
        ))}
      </div>
    </section>
  )
}
