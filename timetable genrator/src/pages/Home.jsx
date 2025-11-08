import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="max-w-4xl mx-auto space-y-8 text-center py-12">
      <div className="text-8xl mb-4 animate-bounce">🎓</div>
      <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
        Welcome to ATGS
      </h1>
      <p className="text-2xl text-gray-700 font-medium">
        Automatic Timetable Generator & Scheduler
      </p>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Streamline your academic scheduling with our intelligent timetable generation system. 
        Perfect for administrators, faculty, and students.
      </p>
      <div className="flex gap-4 justify-center mt-8">
        <Link to="/auth/login" className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          🚀 Get Started
        </Link>
        <Link to="/auth/signup" className="px-8 py-3 rounded-lg bg-white border-2 border-purple-600 text-purple-600 font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
          ✨ Sign Up
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-3 mt-12">
        <div className="gradient-blue rounded-xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-200">
          <div className="text-4xl mb-2">👨‍💼</div>
          <h3 className="font-bold text-xl">Admin</h3>
          <p className="text-sm text-white/90 mt-2">Manage schedules & resources</p>
        </div>
        <div className="gradient-green rounded-xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-200">
          <div className="text-4xl mb-2">👨‍🏫</div>
          <h3 className="font-bold text-xl">Faculty</h3>
          <p className="text-sm text-white/90 mt-2">View & manage your classes</p>
        </div>
        <div className="gradient-card rounded-xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-200">
          <div className="text-4xl mb-2">👨‍🎓</div>
          <h3 className="font-bold text-xl">Student</h3>
          <p className="text-sm text-white/90 mt-2">Access your timetable</p>
        </div>
      </div>
    </section>
  )
}
