import CalendarView from '../../components/timetable/CalendarView.jsx'

export default function FacultySchedule() {
  return (
    <section className="max-w-7xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-6">My Schedule</h2>
      <CalendarView />
    </section>
  )
}
