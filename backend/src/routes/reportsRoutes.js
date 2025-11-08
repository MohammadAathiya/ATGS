import express from 'express'
import Timetable from '../models/Timetable.js'

const router = express.Router()

// GET /api/reports/faculty - assigned and remaining hours by faculty
router.get('/faculty', async (_req, res) => {
  const latest = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  const entries = latest?.entries || []
  const byFaculty = {}
  for (const e of entries) {
    const key = e.faculty
    byFaculty[key] = byFaculty[key] || { faculty: key, assigned: 0 }
    byFaculty[key].assigned += 1
  }
  const report = Object.values(byFaculty).map(r => ({
    faculty: r.faculty,
    assignedHours: r.assigned,
  }))
  res.json({ data: report })
})

// GET /api/reports/rooms - utilization by room (count of used slots)
router.get('/rooms', async (_req, res) => {
  const latest = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  const entries = latest?.entries || []
  const byRoom = {}
  for (const e of entries) {
    const key = e.classroom
    byRoom[key] = byRoom[key] || { room: key, usedSlots: 0 }
    byRoom[key].usedSlots += 1
  }
  const report = Object.values(byRoom)
  res.json({ data: report })
})

// GET /api/reports/gaps - basic gaps per section per day
router.get('/gaps', async (_req, res) => {
  const latest = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  const entries = latest?.entries || []
  const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Mon','Tue','Wed','Thu','Fri']
  const bySectionDay = {}
  for (const e of entries) {
    const k = `${e.section}|${e.day}`
    bySectionDay[k] = bySectionDay[k] || []
    bySectionDay[k].push(e.start)
  }
  const report = []
  for (const k of Object.keys(bySectionDay)) {
    const [section, day] = k.split('|')
    const starts = bySectionDay[k].sort()
    // naive gaps: difference between adjacent start times > 1 hour slot
    let gaps = 0
    for (let i=1;i<starts.length;i++) {
      const [h1,m1]=starts[i-1].split(':').map(Number)
      const [h2,m2]=starts[i].split(':').map(Number)
      const diff = (h2*60+m2)-(h1*60+m1)
      if (diff>60) gaps++
    }
    report.push({ section, day, gaps })
  }
  res.json({ data: report })
})

export default router
