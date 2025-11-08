export default function AdminReports() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Admin • Reports</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">Export PDF</button>
        <button className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-800">Export Excel</button>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">Choose a report to export.</p>
    </section>
  )
}
