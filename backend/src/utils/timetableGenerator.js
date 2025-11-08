import Timetable from '../models/Timetable.js'

// Utility: time slots 1-hour blocks
const DAYS = ['Mon','Tue','Wed','Thu','Fri']
const SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00']

function slotEnd(start) {
  const [h,m] = start.split(':').map(Number)
  const d = new Date(2000,0,1,h,m)
  d.setHours(d.getHours()+1)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export function detectConflicts(entries) {
  const conflicts = []
  const keyMap = new Map()
  for (const e of entries) {
    const k1 = `${e.day}-${e.start}-${e.faculty}`
    const k2 = `${e.day}-${e.start}-${e.classroom}`
    const k3 = `${e.day}-${e.start}-${e.section}-${e.department}-${e.semester}`
    for (const k of [k1,k2,k3]) {
      if (keyMap.has(k)) {
        conflicts.push(`Conflict at ${e.day} ${e.start}: ${k}`)
      }
      keyMap.set(k, true)
    }
  }
  return conflicts
}

export async function generateTimetable({ courses, faculty, rooms }) {
  // Data normalization
  const facultyBySubject = new Map()
  for (const f of faculty) {
    for (const subj of f.subjects || []) {
      const list = facultyBySubject.get(subj) || []
      list.push(f)
      facultyBySubject.set(subj, list)
    }
  }

  // Availability maps
  const facBusy = new Map() // key: facultyId -> Set(day-slot)
  const roomBusy = new Map() // key: roomCode -> Set(day-slot)
  const sectionBusy = new Map() // key: dept-sem-sec -> Set(day-slot)
  const facLoad = new Map() // weekly hours

  const entries = []

  // Build tasks: each course session is a task per section and per hour/week
  const tasks = []
  for (const c of courses) {
    const secs = c.sections && c.sections.length ? c.sections : ['A']
    for (const s of secs) {
      const count = Number(c.hoursPerWeek || 3)
      for (let i=0;i<count;i++) {
        tasks.push({ course: c, section: s })
      }
    }
  }

  // Sort tasks by constraint hardness (more credits/less teachers first)
  tasks.sort((a,b) => {
    const ta = (facultyBySubject.get(a.course.code) || []).length
    const tb = (facultyBySubject.get(b.course.code) || []).length
    return ta - tb
  })

  function canFacultyTeach(f, course) {
    return (f.subjects || []).includes(course.code)
  }

  function isFacultyAvailable(f, day, slot) {
    // If availability provided, honor; else assume available
    if (!f.availability || f.availability.length === 0) return true
    const dayAvail = f.availability.find(a => a.day === day)
    if (!dayAvail) return false
    return dayAvail.slots.includes(slot)
  }

  function tryAssign(taskIndex) {
    if (taskIndex >= tasks.length) return true
    const { course, section } = tasks[taskIndex]

    const teachers = facultyBySubject.get(course.code) || []
    // iterate days and slots
    for (const day of DAYS) {
      for (const slot of SLOTS) {
        const secKey = `${course.department}-${course.semester}-${section}`
        const dsKey = `${day}-${slot}`

        // section availability
        const secSet = sectionBusy.get(secKey) || new Set()
        if (secSet.has(dsKey)) continue

        // find a room
        for (const room of rooms) {
          if (course.type === 'Lab' && room.type !== 'Lab') continue
          const rSet = roomBusy.get(room.code) || new Set()
          if (rSet.has(dsKey)) continue

          // choose a teacher
          for (const f of teachers) {
            if (!isFacultyAvailable(f, day, slot)) continue
            const fb = facBusy.get(f._id?.toString() || f.email || f.name) || new Set()
            if (fb.has(dsKey)) continue
            const load = facLoad.get(f._id?.toString() || f.email || f.name) || 0
            if (load >= (f.maxLoadPerWeek || 12)) continue

            // assign
            const entry = {
              day,
              start: slot,
              end: slotEnd(slot),
              courseCode: course.code,
              courseName: course.name,
              faculty: f.name,
              classroom: room.code,
              section,
              department: course.department,
              semester: course.semester,
            }
            entries.push(entry)
            // mark busy
            fb.add(dsKey); facBusy.set(f._id?.toString() || f.email || f.name, fb)
            rSet.add(dsKey); roomBusy.set(room.code, rSet)
            secSet.add(dsKey); sectionBusy.set(secKey, secSet)
            facLoad.set(f._id?.toString() || f.email || f.name, load + 1)

            if (tryAssign(taskIndex + 1)) return true

            // backtrack
            entries.pop()
            fb.delete(dsKey)
            rSet.delete(dsKey)
            secSet.delete(dsKey)
            facLoad.set(f._id?.toString() || f.email || f.name, load)
          }
        }
      }
    }
    return false
  }

  const success = tryAssign(0)
  const conflicts = detectConflicts(entries)

  return {
    success,
    timetable: entries,
    conflicts,
  }
}

export async function saveTimetable(result) {
  const doc = await Timetable.create({
    entries: result.timetable,
    metadata: {
      conflicts: result.conflicts,
      success: result.success,
      generatedAt: new Date(),
    }
  })
  return doc
}
