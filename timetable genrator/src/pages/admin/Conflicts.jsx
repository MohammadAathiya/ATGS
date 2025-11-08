export default function AdminConflicts() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Admin • Conflicts</h2>
      <ul className="list-disc pl-6 text-sm">
        <li>Faculty overlap sample</li>
        <li>Room double-book sample</li>
        <li>Capacity mismatch sample</li>
      </ul>
      <div className="text-sm text-slate-600 dark:text-slate-300">Use the calendar editor to drag-and-drop and fix conflicts.</div>
    </section>
  )
}
