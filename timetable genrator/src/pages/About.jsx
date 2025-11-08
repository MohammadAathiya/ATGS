import { Link } from 'react-router-dom'

export default function About() {
  return (
    <section className="max-w-5xl mx-auto space-y-12 py-12">
      <div className="text-center space-y-4">
        <div className="text-7xl mb-4">🎓</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
          About ATGS
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Automatic Timetable Generator & Scheduler - Your intelligent solution for academic scheduling
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="gradient-blue rounded-xl p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
          <p className="text-white/90">
            To revolutionize academic scheduling by providing an intelligent, automated system that saves time and eliminates conflicts.
          </p>
        </div>
        
        <div className="gradient-green rounded-xl p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">💡</div>
          <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
          <p className="text-white/90">
            To be the leading timetable management solution for educational institutions worldwide.
          </p>
        </div>
        
        <div className="gradient-card rounded-xl p-8 text-white shadow-xl">
          <div className="text-5xl mb-4">⭐</div>
          <h3 className="text-2xl font-bold mb-3">Our Values</h3>
          <p className="text-white/90">
            Innovation, reliability, and user-centric design drive everything we do.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-purple-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Automated Generation</h4>
              <p className="text-gray-600">One-click timetable generation with intelligent conflict resolution</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Analytics Dashboard</h4>
              <p className="text-gray-600">Real-time insights and reports on resource utilization</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔄</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Easy Modifications</h4>
              <p className="text-gray-600">Quick adjustments and substitution management</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-3xl">📱</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Multi-Platform Access</h4>
              <p className="text-gray-600">Access your timetable anywhere, anytime on any device</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔔</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Real-time Notifications</h4>
              <p className="text-gray-600">Instant updates on schedule changes and conflicts</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-3xl">📤</div>
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-2">Export Options</h4>
              <p className="text-gray-600">Download timetables in PDF, Excel, or iCalendar format</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Ready to Get Started?</h2>
        <p className="text-lg text-gray-600">Join thousands of institutions using ATGS for efficient scheduling</p>
        <div className="flex gap-4 justify-center">
          <Link to="/auth/signup" className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            🎉 Sign Up Now
          </Link>
          <Link to="/auth/login" className="px-8 py-3 rounded-lg bg-white border-2 border-purple-600 text-purple-600 font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
            🔑 Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
