export default function AdminAnalytics() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Admin • Analytics</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border rounded-lg p-4"><h3 className="font-medium mb-2">Faculty Load</h3><div className="text-sm">Chart placeholder</div></div>
        <div className="border rounded-lg p-4"><h3 className="font-medium mb-2">Room Utilization</h3><div className="text-sm">Chart placeholder</div></div>
        <div className="border rounded-lg p-4"><h3 className="font-medium mb-2">Conflict Heatmap</h3><div className="text-sm">Chart placeholder</div></div>
        <div className="border rounded-lg p-4"><h3 className="font-medium mb-2">Section Coverage</h3><div className="text-sm">Chart placeholder</div></div>
      </div>
    </section>
  )
}
