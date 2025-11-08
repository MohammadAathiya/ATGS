 import express from 'express'
 import Course from '../models/Course.js'
 import Faculty from '../models/Faculty.js'
 import Room from '../models/Room.js'
 import Section from '../models/Section.js'
 import Timetable from '../models/Timetable.js'
 import { auth, allowRoles } from '../middleware/auth.js'
 import { generateTimetable, saveTimetable } from '../utils/timetableGenerator.js'
 import { spawn } from 'child_process'
 import path from 'path'
 import { fileURLToPath } from 'url'

const router = express.Router()

// Fetch latest timetable
router.get('/', auth, async (_req, res) => {
  const doc = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  res.json(doc || { entries: [], metadata: { success: false, conflicts: [] } })
})

function mapToPythonInput(courses, faculty, rooms) {
  // Choose a faculty for each course based on subjects list when possible
  const subjectTeachers = new Map()
  for (const f of faculty) {
    for (const subj of f.subjects || []) {
      const arr = subjectTeachers.get(subj) || []
      arr.push(f)
      subjectTeachers.set(subj, arr)
    }
  }

  const pyCourses = []
  for (const c of courses) {
    const sections = c.sections && c.sections.length ? c.sections : ['A']
    for (const sec of sections) {
      let teacher = 'TBA'
      const teachers = subjectTeachers.get(c.code) || []
      if (teachers.length) {
        teacher = teachers[0].name
      } else {
        // try same-department fallback
        const sameDept = (faculty || []).find(f => (f.department || '') === (c.department || ''))
        if (sameDept) teacher = sameDept.name
        else if (faculty && faculty.length) teacher = faculty[0].name
      }
      pyCourses.push({
        courseCode: c.code,
        courseName: c.name,
        facultyName: teacher,
        section: sec,
        hoursPerWeek: Number(c.hoursPerWeek || 3),
        department: c.department || 'General',
      })
    }
  }

  const pyFaculty = faculty.map(f => ({
    name: f.name,
    department: f.department || 'General',
    email: f.email || '',
  }))

  const pyRooms = rooms.map(r => ({
    roomNumber: r.code,
    capacity: Number(r.capacity || 40),
    building: r.department || '',
  }))

  return { courses: pyCourses, faculty: pyFaculty, classrooms: pyRooms }
}

async function callPythonScheduler(pyInput) {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const scriptPath = path.resolve(__dirname, '..', 'py', 'run_scheduler.py')

    const child = spawn('python', [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => { stdout += d.toString() })
    child.stderr.on('data', (d) => { stderr += d.toString() })
    child.on('error', (err) => reject(err))
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(stderr || `Python exited with code ${code}`))
      try {
        const parsed = JSON.parse(stdout)
        resolve(parsed)
      } catch (e) {
        reject(new Error('Failed to parse Python output: ' + e.message + '\n' + stdout))
      }
    })
    child.stdin.write(JSON.stringify(pyInput))
    child.stdin.end()
  })
}

// Generate timetable from DB or provided data; try Python first
router.post('/generate', auth, allowRoles('Admin'), async (req, res) => {
  try {
    let { courses, faculty, rooms, persist = true } = req.body || {}

    if (!courses) courses = await Course.find().lean()
    if (!faculty) faculty = await Faculty.find().lean()
    if (!rooms) rooms = await Room.find().lean()
    const sections = await Section.find().lean().catch(() => [])

    if (!courses.length) return res.status(400).json({ message: 'No courses found. Upload courses first.' })
    if (!faculty.length) return res.status(400).json({ message: 'No faculty found. Upload faculty first.' })
    if (!rooms.length) return res.status(400).json({ message: 'No rooms found. Upload classrooms first.' })

    let result
    // Attempt Python CSP algorithm first
    try {
      const pyInput = mapToPythonInput(courses, faculty, rooms)
      // Build section strengths map
      pyInput.sectionStrengths = {}
      for (const s of sections || []) {
        const key = s.name || s.sectionId
        if (key) pyInput.sectionStrengths[key] = Number(s.strength || 0)
      }
      const pyOut = await callPythonScheduler(pyInput)
      const entries = (pyOut.schedule || []).map((e) => ({
        day: e.day,
        start: e.startTime,
        end: e.endTime,
        courseCode: e.courseCode,
        courseName: e.courseName,
        faculty: e.faculty,
        classroom: e.classroom,
        section: e.section,
        department: e.department || 'General',
      }))
      result = { success: !!pyOut.success, timetable: entries, conflicts: pyOut.conflicts || [] }
    } catch (err) {
      // Fallback to JS backtracking
      result = await generateTimetable({ courses, faculty, rooms })
    }

    if (persist) {
      const saved = await saveTimetable(result)
      req.app.get('io').emit('notify', { type: result.success ? 'success' : 'warning', message: 'Timetable generated' })
      return res.json({ ...result, id: saved._id })
    }

    return res.json(result)
  } catch (e) {
    res.status(500).json({ message: 'Generation failed', error: e.message })
  }
})

export default router
