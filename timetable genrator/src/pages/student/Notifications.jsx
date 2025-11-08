export default function StudentNotifications() {
  const notifications = [
    { id: 1, type: 'info', icon: '📢', title: 'Room Change', message: 'CS101 moved to Room 204', time: '2 hours ago' },
    { id: 2, type: 'warning', icon: '⚠️', title: 'Faculty Change', message: 'Prof. Smith replaced by Prof. Johnson for tomorrow', time: '5 hours ago' },
    { id: 3, type: 'success', icon: '✅', title: 'Schedule Updated', message: 'Your timetable has been updated successfully', time: '1 day ago' },
  ]

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">
        Student • Notifications
      </h2>
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{notif.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{notif.title}</h3>
                <p className="text-gray-600 mb-2">{notif.message}</p>
                <p className="text-sm text-gray-400">{notif.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
