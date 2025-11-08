import CalendarView from '../../components/timetable/CalendarView.jsx'

export default function StudentTimetable() {
  return (
    <section className="max-w-7xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Student • Timetable</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <select className="border rounded p-2"><option>Block N</option><option>Block H</option><option>Block U</option></select>
        <select className="border rounded p-2"><option>CSE</option><option>ECE</option><option>EEE</option></select>
        <select className="border rounded p-2"><option>Sem 1</option><option>Sem 3</option><option>Sem 5</option></select>
        <select className="border rounded p-2"><option>Section A</option><option>Section B</option></select>
      </div>
      <CalendarView />
    </section>
  )
}
