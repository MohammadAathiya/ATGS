export default function FacultyUnavailability() {
  return (
    <section className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Mark Unavailability</h2>
      <h2 className="text-xl font-semibold">Faculty • Unavailability</h2>
      <form className="grid gap-3 max-w-md">
        <label className="grid gap-1 text-sm">
          Day
          <select className="border rounded p-2"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select>
        </label>
        <label className="grid gap-1 text-sm">
          Time Range
          <input className="border rounded p-2" placeholder="e.g., 10:00 - 11:00" />
        </label>
        <button className="px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">Save</button>
      </form>
    </section>
  )
}
