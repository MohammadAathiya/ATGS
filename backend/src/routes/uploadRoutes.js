import express from 'express'
import Course from '../models/Course.js'
import Faculty from '../models/Faculty.js'
import Room from '../models/Room.js'
import { auth, allowRoles } from '../middleware/auth.js'
import Section from '../models/Section.js'

const router = express.Router()

// Accepts JSON { data: [...] } for keys: courses, faculty, classrooms, departments, sections
router.post('/:key', auth, allowRoles('Admin'), async (req, res) => {
  const { key } = req.params
  const { data } = req.body || {}
  if (!Array.isArray(data)) return res.status(400).json({ message: 'data must be an array' })

  try {
    // Basic validators per key
    const ensure = (cond, msg) => { if (!cond) throw new Error(msg) }
    const errors = []
    let count = 0
    if (key === 'courses') {
      for (const row of data) {
        const doc = {
          code: row.code || row.Code || row.courseCode || row.CourseCode || row.course_id,
          name: row.name || row.Name || row.courseName || row.CourseName || row.course_name,
          department: row.department || row.Department || row.dept,
          credits: Number(row.credits || row.Credits || row.default_credits || 3),
          hoursPerWeek: Number(row.hoursPerWeek || row.HoursPerWeek || row.Hours || row.default_hours_per_week || 3),
          type: String(row.type || row.Type || row.preferred_room_type || 'Theory').trim(),
          semester: Number(row.semester || row.Semester || 1),
          sections: Array.isArray(row.sections) ? row.sections : (
            row.Sections ? String(row.Sections).split(/[;,\s]+/).filter(Boolean) : []
          ),
        }
        if (!doc.code || !doc.name) {
          errors.push({ row: row, error: 'Missing course code/name' })
          continue
        }
        await Course.findOneAndUpdate({ code: doc.code }, doc, { upsert: true })
        count++
      }
    } else if (key === 'faculty') {
      for (const row of data) {
        const subjects = row.subjects || row.Subjects || row.qualified_courses
        const doc = {
          name: row.name || row.Name || row.full_name,
          email: (row.email || row.Email || '').toLowerCase(),
          department: row.department || row.Department || row.dept,
          maxLoadPerWeek: Number(row.maxLoadPerWeek || row.MaxLoadPerWeek || row.max_hours_week || 18),
          subjects: subjects ? String(subjects).split(/[;,\s]+/).filter(Boolean) : [],
          availability: [],
        }
        if (!doc.name) {
          errors.push({ row: row, error: 'Missing faculty name' })
          continue
        }
        await Faculty.findOneAndUpdate({ email: doc.email || doc.name }, doc, { upsert: true })
        count++
      }
    } else if (key === 'classrooms') {
      for (const row of data) {
        const doc = {
          code: row.code || row.Code || row.room || row.Room || row.room_id,
          capacity: Number(row.capacity || row.Capacity || 40),
          type: String(row.type || row.Type || 'Lecture').trim(),
          department: row.department || row.Department,
        }
        if (!doc.code) {
          errors.push({ row: row, error: 'Missing room code/id' })
          continue
        }
        await Room.findOneAndUpdate({ code: doc.code }, doc, { upsert: true })
        count++
      }
    } else if (key === 'sections') {
      for (const row of data) {
        const doc = {
          sectionId: row.sectionId || row.SectionId || row.section || row.Section || row.section_id,
          name: row.name || row.Name || row.sectionName || row.section || row.Section || row.section_name,
          year: Number(row.year || row.Year || 0),
          department: row.department || row.Department || '',
          semester: Number(row.semester || row.Semester || 0),
          strength: Number(row.strength || row.Strength || row.sectionStrength || row.size || 0),
        }
        if (!doc.sectionId && !doc.name) {
          errors.push({ row: row, error: 'Missing section id/name' })
          continue
        }
        const query = doc.sectionId ? { sectionId: doc.sectionId } : { name: doc.name }
        await Section.findOneAndUpdate(query, doc, { upsert: true })
        count++
      }
    } else if (key === 'departments') {
      // Not persisted; departments are optional for now
      count = data.length
    } else {
      return res.status(400).json({ message: 'Unknown key' })
    }

    if (errors.length) {
      return res.status(400).json({ message: 'Validation errors', errors, imported: count })
    }
    res.json({ ok: true, imported: count })
  } catch (e) {
    res.status(500).json({ message: 'Upload failed', error: e.message })
  }
})

export default router
