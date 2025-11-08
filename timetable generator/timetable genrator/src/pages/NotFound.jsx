import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="max-w-2xl mx-auto text-center py-20">
      <div className="text-9xl mb-6">😕</div>
      <h2 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
        404 - Page Not Found
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 inline-block">
        🏠 Go Back Home
      </Link>
    </section>
  )
}
