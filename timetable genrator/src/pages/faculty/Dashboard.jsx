import { Link } from 'react-router-dom'

export default function FacultyDashboard() {
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-8">
        Faculty Dashboard
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <Link to="/faculty/schedule" className="gradient-blue rounded-xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="text-4xl mb-2">📅</div>
          <h3 className="font-bold text-xl mb-2">My Schedule</h3>
          <p className="text-sm text-white/90">View assigned lectures</p>
        </Link>
        <Link to="/faculty/unavailability" className="gradient-orange rounded-xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="text-4xl mb-2">🚫</div>
          <h3 className="font-bold text-xl mb-2">Unavailability</h3>
          <p className="text-sm text-white/90">Mark leave slots</p>
        </Link>
        <Link to="/faculty/requests" className="gradient-purple rounded-xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="text-4xl mb-2">🔄</div>
          <h3 className="font-bold text-xl mb-2">Substitution Requests</h3>
          <p className="text-sm text-white/90">Request swaps</p>
        </Link>
        <Link to="/faculty/analytics" className="gradient-green rounded-xl p-6 text-center text-white shadow-xl hover:scale-105 transition-transform duration-200 cursor-pointer">
          <div className="text-4xl mb-2">📈</div>
          <h3 className="font-bold text-xl mb-2">Analytics</h3>
          <p className="text-sm text-white/90">Hours and distribution</p>
        </Link>
      </div>
    </section>
  )
}
