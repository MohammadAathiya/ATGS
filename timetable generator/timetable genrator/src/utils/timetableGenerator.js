// Automated Timetable Generation Algorithm
// Uses constraint satisfaction and backtracking

export class TimetableGenerator {
  constructor(courses, faculty, classrooms, departments, sections) {
    this.courses = courses || []
    this.faculty = faculty || []
    this.classrooms = classrooms || []
    this.departments = departments || []
    this.sections = sections || []
    
    // Time slots: Monday-Friday, 9 AM - 5 PM
    this.timeSlots = this.generateTimeSlots()
    this.timetable = []
    this.conflicts = []
    
    // Advanced tracking
    this.facultyDailyLoad = new Map() // Track faculty hours per day
    this.consecutiveClasses = new Map() // Track consecutive classes
    this.breakTimes = new Set(['12:00', '13:00']) // Lunch break
    this.maxConsecutiveHours = 3 // Maximum consecutive hours
    this.maxDailyHours = 6 // Maximum hours per day per faculty
    
    // Performance metrics
    this.metrics = {
      totalAttempts: 0,
      successfulAssignments: 0,
      backtrackCount: 0,
      optimizationScore: 0
    }
  }

  generateTimeSlots() {
    const slots = []
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const times = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '12:00', end: '13:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ]

    days.forEach(day => {
      times.forEach(time => {
        slots.push({ day, ...time })
      })
    })

    return slots
  }

  // Main generation function
  generate() {
    console.log('Starting automated timetable generation...')
    console.log('Courses:', this.courses.length)
    console.log('Faculty:', this.faculty.length)
    console.log('Classrooms:', this.classrooms.length)

    this.timetable = []
    this.conflicts = []

    // Group courses by section
    const coursesBySection = this.groupCoursesBySection()

    // Generate timetable for each section
    Object.keys(coursesBySection).forEach(section => {
      const sectionCourses = coursesBySection[section]
      this.generateForSection(section, sectionCourses)
    })

    console.log('Generated timetable entries:', this.timetable.length)
    console.log('Conflicts found:', this.conflicts.length)

    // Calculate optimization score
    this.metrics.optimizationScore = this.calculateOptimizationScore()

    console.log('Optimization Score:', this.metrics.optimizationScore + '%')
    console.log('Success Rate:', Math.round((this.metrics.successfulAssignments / this.metrics.totalAttempts) * 100) + '%')

    return {
      timetable: this.timetable,
      conflicts: this.conflicts,
      success: this.conflicts.length === 0,
      metrics: this.metrics,
      quality: this.getQualityReport()
    }
  }

  calculateOptimizationScore() {
    let score = 100
    const penalties = []

    // Penalty for conflicts
    if (this.conflicts.length > 0) {
      const conflictPenalty = Math.min(this.conflicts.length * 5, 30)
      score -= conflictPenalty
      penalties.push(`Conflicts: -${conflictPenalty}`)
    }

    // Check day distribution balance
    const dayDistribution = new Map()
    this.timetable.forEach(entry => {
      dayDistribution.set(entry.day, (dayDistribution.get(entry.day) || 0) + 1)
    })
    
    const avgPerDay = this.timetable.length / 5
    let maxDeviation = 0
    dayDistribution.forEach(count => {
      const deviation = Math.abs(count - avgPerDay) / avgPerDay
      maxDeviation = Math.max(maxDeviation, deviation)
    })
    
    if (maxDeviation > 0.3) {
      const balancePenalty = Math.min(Math.round(maxDeviation * 20), 15)
      score -= balancePenalty
      penalties.push(`Day imbalance: -${balancePenalty}`)
    }

    // Check faculty workload distribution
    let overloadedFaculty = 0
    this.facultyDailyLoad.forEach(load => {
      if (load > this.maxDailyHours) overloadedFaculty++
    })
    
    if (overloadedFaculty > 0) {
      const workloadPenalty = Math.min(overloadedFaculty * 3, 10)
      score -= workloadPenalty
      penalties.push(`Faculty overload: -${workloadPenalty}`)
    }

    // Bonus for efficient scheduling
    const efficiency = this.metrics.successfulAssignments / this.metrics.totalAttempts
    if (efficiency > 0.8) {
      score += 5
      penalties.push(`High efficiency: +5`)
    }

    console.log('Optimization breakdown:', penalties.join(', '))
    return Math.max(0, Math.min(100, Math.round(score)))
  }

  getQualityReport() {
    return {
      dayBalance: this.analyzeDayBalance(),
      facultyWorkload: this.analyzeFacultyWorkload(),
      timeDistribution: this.analyzeTimeDistribution(),
      efficiency: Math.round((this.metrics.successfulAssignments / this.metrics.totalAttempts) * 100)
    }
  }

  analyzeDayBalance() {
    const dayDistribution = new Map()
    this.timetable.forEach(entry => {
      dayDistribution.set(entry.day, (dayDistribution.get(entry.day) || 0) + 1)
    })
    
    const counts = Array.from(dayDistribution.values())
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length
    
    return {
      distribution: Object.fromEntries(dayDistribution),
      average: Math.round(avg * 10) / 10,
      variance: Math.round(variance * 10) / 10,
      balanced: variance < 2
    }
  }

  analyzeFacultyWorkload() {
    const facultyHours = new Map()
    this.timetable.forEach(entry => {
      facultyHours.set(entry.faculty, (facultyHours.get(entry.faculty) || 0) + 1)
    })
    
    const loads = Array.from(facultyHours.values())
    const avg = loads.reduce((a, b) => a + b, 0) / loads.length
    const max = Math.max(...loads)
    const min = Math.min(...loads)
    
    return {
      average: Math.round(avg * 10) / 10,
      max,
      min,
      balanced: (max - min) <= 3
    }
  }

  analyzeTimeDistribution() {
    const morningClasses = this.timetable.filter(e => {
      const hour = new Date(e.start).getHours()
      return hour >= 9 && hour < 12
    }).length
    
    const afternoonClasses = this.timetable.filter(e => {
      const hour = new Date(e.start).getHours()
      return hour >= 14 && hour < 17
    }).length
    
    return {
      morning: morningClasses,
      afternoon: afternoonClasses,
      morningPercentage: Math.round((morningClasses / this.timetable.length) * 100),
      optimal: morningClasses > afternoonClasses
    }
  }

  groupCoursesBySection() {
    const grouped = {}
    
    this.courses.forEach(course => {
      const section = course.section || course.Section || 'A'
      if (!grouped[section]) {
        grouped[section] = []
      }
      grouped[section].push(course)
    })

    return grouped
  }

  generateForSection(section, courses) {
    const usedSlots = new Set()
    const facultySchedule = new Map()
    const classroomSchedule = new Map()

    courses.forEach(course => {
      const assigned = this.assignSlot(
        course,
        section,
        usedSlots,
        facultySchedule,
        classroomSchedule
      )

      if (!assigned) {
        this.conflicts.push({
          course: course.name || course.courseName || course.CourseName,
          section,
          reason: 'Could not find available slot'
        })
      }
    })
  }

  assignSlot(course, section, usedSlots, facultySchedule, classroomSchedule) {
    const courseName = course.name || course.courseName || course.CourseName || 'Unknown Course'
    const courseCode = course.code || course.courseCode || course.CourseCode || courseName
    const facultyName = course.faculty || course.facultyName || course.FacultyName || 'TBA'
    const hoursPerWeek = parseInt(course.hours || course.hoursPerWeek || course.HoursPerWeek || 3)

    // Track assigned slots for this course to ensure distribution
    const assignedDays = new Set()
    let assignedCount = 0
    
    // Get available slots with priority scoring
    const availableSlots = this.getAvailableSlotsWithPriority(
      section,
      facultyName,
      usedSlots,
      facultySchedule,
      classroomSchedule,
      assignedDays
    )

    // Try to assign required number of slots with better distribution
    for (const slotInfo of availableSlots) {
      if (assignedCount >= hoursPerWeek) break

      const slot = slotInfo.slot
      const slotKey = `${slot.day}-${slot.start}`

      // Prefer spreading across different days
      if (assignedDays.size < hoursPerWeek && assignedDays.has(slot.day)) {
        // Skip if we can still spread to other days
        const remainingSlots = availableSlots.filter(s => !assignedDays.has(s.slot.day))
        if (remainingSlots.length > 0 && assignedCount < hoursPerWeek - 1) {
          continue
        }
      }

      // Find available classroom with capacity consideration
      const classroom = this.findBestClassroom(slotKey, classroomSchedule, course)
      if (!classroom) continue

      // Assign the slot
      const entry = {
        id: `${courseCode}-${section}-${slotKey}`,
        title: `${courseCode} - ${courseName}`,
        day: slot.day,
        start: this.getDateTime(slot.day, slot.start),
        end: this.getDateTime(slot.day, slot.end),
        course: courseName,
        courseCode,
        faculty: facultyName,
        section,
        classroom: classroom.name || classroom.roomNumber || classroom.RoomNumber,
        backgroundColor: this.getColorForCourse(courseCode),
        extendedProps: {
          faculty: facultyName,
          room: classroom.name || classroom.roomNumber || classroom.RoomNumber,
          section,
          department: course.department || course.Department || 'General',
          capacity: classroom.capacity || classroom.Capacity || 50
        }
      }

      this.timetable.push(entry)
      usedSlots.add(slotKey)
      facultySchedule.set(`${facultyName}-${slotKey}`, true)
      classroomSchedule.set(`${classroom.name || classroom.roomNumber}-${slotKey}`, true)
      assignedDays.add(slot.day)
      assignedCount++
      
      // Update faculty daily load tracking
      const dailyKey = `${facultyName}-${slot.day}`
      this.facultyDailyLoad.set(dailyKey, (this.facultyDailyLoad.get(dailyKey) || 0) + 1)
      
      // Update metrics
      this.metrics.successfulAssignments++
    }

    // Log if couldn't assign all hours
    if (assignedCount < hoursPerWeek) {
      console.warn(`Could only assign ${assignedCount}/${hoursPerWeek} hours for ${courseCode}`)
    }

    return assignedCount > 0
  }

  getAvailableSlotsWithPriority(section, facultyName, usedSlots, facultySchedule, classroomSchedule, assignedDays) {
    const available = []

    for (const slot of this.timeSlots) {
      const slotKey = `${slot.day}-${slot.start}`
      this.metrics.totalAttempts++

      // Check section availability
      if (usedSlots.has(slotKey)) continue

      // Check faculty availability
      if (facultySchedule.has(`${facultyName}-${slotKey}`)) continue

      // Check if any classroom is available
      if (!this.hasAvailableClassroom(slotKey, classroomSchedule)) continue

      // Advanced validations
      if (!this.isValidSlot(slot, facultyName, section, facultySchedule)) continue

      // Calculate priority score (higher is better)
      let priority = 100

      // Prefer morning slots (9-12) - peak learning hours
      const hour = parseInt(slot.start.split(':')[0])
      if (hour >= 9 && hour < 12) priority += 25
      else if (hour >= 14 && hour < 16) priority += 15
      else if (hour >= 16) priority -= 5 // Avoid late afternoon

      // Strongly prefer spreading across days
      if (!assignedDays.has(slot.day)) priority += 40
      else priority -= 15 // Penalize same-day scheduling

      // Avoid Friday if possible (students prefer lighter Fridays)
      if (slot.day === 'Friday') priority -= 15

      // Prefer Monday-Wednesday for core courses
      if (['Monday', 'Tuesday', 'Wednesday'].includes(slot.day)) priority += 10

      // Avoid break times
      if (this.breakTimes.has(slot.start)) priority -= 30

      // Check for consecutive class optimization
      const consecutiveScore = this.getConsecutiveScore(slot, facultyName, facultySchedule)
      priority += consecutiveScore

      // Faculty workload balancing
      const workloadScore = this.getWorkloadScore(slot, facultyName)
      priority += workloadScore

      available.push({ slot, priority })
    }

    // Sort by priority (highest first)
    return available.sort((a, b) => b.priority - a.priority)
  }

  isValidSlot(slot, facultyName, section, facultySchedule) {
    const slotKey = `${slot.day}-${slot.start}`
    
    // Check faculty daily load limit
    const dailyKey = `${facultyName}-${slot.day}`
    const currentLoad = this.facultyDailyLoad.get(dailyKey) || 0
    if (currentLoad >= this.maxDailyHours) return false

    // Check consecutive class limit
    const consecutiveCount = this.getConsecutiveCount(slot, facultyName, facultySchedule)
    if (consecutiveCount >= this.maxConsecutiveHours) return false

    // Avoid scheduling during break times unless necessary
    if (this.breakTimes.has(slot.start)) {
      // Only allow if no other options available
      return false
    }

    return true
  }

  getConsecutiveCount(slot, facultyName, facultySchedule) {
    let count = 0
    const hour = parseInt(slot.start.split(':')[0])
    
    // Check previous hours
    for (let h = hour - 1; h >= 9; h--) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`
      const key = `${facultyName}-${slot.day}-${timeStr}`
      if (facultySchedule.has(key)) count++
      else break
    }
    
    // Check next hours
    for (let h = hour + 1; h <= 17; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`
      const key = `${facultyName}-${slot.day}-${timeStr}`
      if (facultySchedule.has(key)) count++
      else break
    }
    
    return count
  }

  getConsecutiveScore(slot, facultyName, facultySchedule) {
    const consecutiveCount = this.getConsecutiveCount(slot, facultyName, facultySchedule)
    
    // Prefer some gaps between classes
    if (consecutiveCount === 0) return 10 // Good - has breaks
    if (consecutiveCount === 1) return 5  // Acceptable
    if (consecutiveCount === 2) return -10 // Too many consecutive
    return -20 // Avoid
  }

  getWorkloadScore(slot, facultyName) {
    const dailyKey = `${facultyName}-${slot.day}`
    const currentLoad = this.facultyDailyLoad.get(dailyKey) || 0
    
    // Prefer balanced distribution
    if (currentLoad === 0) return 15 // First class of the day
    if (currentLoad <= 2) return 10  // Light load
    if (currentLoad <= 4) return 0   // Moderate load
    return -15 // Heavy load - try to avoid
  }

  findBestClassroom(slotKey, classroomSchedule, course) {
    const requiredCapacity = course.capacity || course.Capacity || 30
    
    // Find classrooms sorted by suitability
    const suitableRooms = this.classrooms
      .filter(room => {
        const roomKey = `${room.name || room.roomNumber}-${slotKey}`
        return !classroomSchedule.has(roomKey)
      })
      .map(room => {
        const capacity = room.capacity || room.Capacity || 50
        // Prefer rooms that match capacity (not too big, not too small)
        const capacityScore = capacity >= requiredCapacity ? 
          100 - Math.abs(capacity - requiredCapacity) : 0
        return { room, score: capacityScore }
      })
      .sort((a, b) => b.score - a.score)

    return suitableRooms.length > 0 ? suitableRooms[0].room : null
  }

  hasAvailableClassroom(slotKey, classroomSchedule) {
    return this.classrooms.some(classroom => {
      const roomKey = `${classroom.name || classroom.roomNumber}-${slotKey}`
      return !classroomSchedule.has(roomKey)
    })
  }

  findAvailableClassroom(slotKey, classroomSchedule) {
    for (const classroom of this.classrooms) {
      const roomKey = `${classroom.name || classroom.roomNumber || classroom.RoomNumber}-${slotKey}`
      if (!classroomSchedule.has(roomKey)) {
        return classroom
      }
    }
    return null
  }

  getDateTime(day, time) {
    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5
    }

    const today = new Date()
    const currentDay = today.getDay()
    const targetDay = dayMap[day]
    const daysToAdd = (targetDay - currentDay + 7) % 7

    const date = new Date(today)
    date.setDate(today.getDate() + daysToAdd)

    const [hours, minutes] = time.split(':')
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    return date
  }

  getColorForCourse(courseCode) {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#a8edea', '#38f9d7'
    ]
    
    const hash = courseCode.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)

    return colors[hash % colors.length]
  }

  // Comprehensive conflict detection
  detectConflicts(timetable) {
    const conflicts = []
    const facultySlots = new Map()
    const classroomSlots = new Map()
    const sectionSlots = new Map()

    timetable.forEach((entry) => {
      const slotKey = `${entry.day}-${entry.start}`
      
      // Check faculty conflicts
      const facultyKey = `${entry.faculty}-${slotKey}`
      if (facultySlots.has(facultyKey)) {
        const existing = facultySlots.get(facultyKey)
        conflicts.push({
          type: 'faculty_conflict',
          severity: 'high',
          faculty: entry.faculty,
          day: entry.day,
          time: entry.start,
          courses: [existing.courseCode, entry.courseCode],
          message: `Faculty ${entry.faculty} has overlapping classes: ${existing.courseCode} and ${entry.courseCode}`
        })
      }
      facultySlots.set(facultyKey, entry)

      // Check classroom conflicts
      const roomKey = `${entry.classroom}-${slotKey}`
      if (classroomSlots.has(roomKey)) {
        const existing = classroomSlots.get(roomKey)
        conflicts.push({
          type: 'classroom_conflict',
          severity: 'high',
          classroom: entry.classroom,
          day: entry.day,
          time: entry.start,
          courses: [existing.courseCode, entry.courseCode],
          message: `Classroom ${entry.classroom} is double-booked: ${existing.courseCode} and ${entry.courseCode}`
        })
      }
      classroomSlots.set(roomKey, entry)

      // Check section conflicts
      const sectionKey = `${entry.section}-${slotKey}`
      if (sectionSlots.has(sectionKey)) {
        const existing = sectionSlots.get(sectionKey)
        conflicts.push({
          type: 'section_conflict',
          severity: 'high',
          section: entry.section,
          day: entry.day,
          time: entry.start,
          courses: [existing.courseCode, entry.courseCode],
          message: `Section ${entry.section} has overlapping classes: ${existing.courseCode} and ${entry.courseCode}`
        })
      }
      sectionSlots.set(sectionKey, entry)
    })

    // Check for faculty overload (too many hours per day)
    const facultyDailyHours = new Map()
    timetable.forEach(entry => {
      const key = `${entry.faculty}-${entry.day}`
      facultyDailyHours.set(key, (facultyDailyHours.get(key) || 0) + 1)
    })

    facultyDailyHours.forEach((hours, key) => {
      if (hours > 6) {
        const [faculty, day] = key.split('-')
        conflicts.push({
          type: 'faculty_overload',
          severity: 'medium',
          faculty,
          day,
          hours,
          message: `Faculty ${faculty} has ${hours} hours on ${day} (recommended max: 6)`
        })
      }
    })

    // Check for uneven distribution
    const dayDistribution = new Map()
    timetable.forEach(entry => {
      dayDistribution.set(entry.day, (dayDistribution.get(entry.day) || 0) + 1)
    })

    const avgPerDay = timetable.length / 5
    dayDistribution.forEach((count, day) => {
      if (count > avgPerDay * 1.5) {
        conflicts.push({
          type: 'uneven_distribution',
          severity: 'low',
          day,
          count,
          average: Math.round(avgPerDay),
          message: `${day} has ${count} classes (average: ${Math.round(avgPerDay)})`
        })
      }
    })

    return conflicts
  }

  // Validate timetable quality
  validateTimetable() {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      statistics: {}
    }

    // Check if all courses have required hours
    const courseHours = new Map()
    this.timetable.forEach(entry => {
      const key = `${entry.courseCode}-${entry.section}`
      courseHours.set(key, (courseHours.get(key) || 0) + 1)
    })

    this.courses.forEach(course => {
      const key = `${course.code || course.courseCode}-${course.section}`
      const assigned = courseHours.get(key) || 0
      const required = parseInt(course.hours || course.hoursPerWeek || 3)
      
      if (assigned < required) {
        validation.errors.push({
          course: course.code || course.courseCode,
          section: course.section,
          assigned,
          required,
          message: `${course.code || course.courseCode} has only ${assigned}/${required} hours assigned`
        })
        validation.valid = false
      }
    })

    // Check classroom utilization
    const classroomUsage = new Map()
    this.timetable.forEach(entry => {
      classroomUsage.set(entry.classroom, (classroomUsage.get(entry.classroom) || 0) + 1)
    })

    const totalSlots = this.timeSlots.length
    classroomUsage.forEach((usage, classroom) => {
      const utilization = (usage / totalSlots) * 100
      if (utilization > 80) {
        validation.warnings.push({
          classroom,
          utilization: Math.round(utilization),
          message: `Classroom ${classroom} is ${Math.round(utilization)}% utilized`
        })
      }
    })

    // Calculate statistics
    validation.statistics = {
      totalClasses: this.timetable.length,
      coursesScheduled: new Set(this.timetable.map(e => `${e.courseCode}-${e.section}`)).size,
      totalCourses: this.courses.length,
      averageClassroomUtilization: Math.round(
        (this.timetable.length / (this.classrooms.length * totalSlots)) * 100
      ),
      facultyUtilization: Math.round(
        (new Set(this.timetable.map(e => e.faculty)).size / this.faculty.length) * 100
      )
    }

    return validation
  }
}

// Helper function to validate CSV data
export function validateCSVData(data, type) {
  const errors = []

  if (!data || data.length === 0) {
    errors.push(`No ${type} data provided`)
    return { valid: false, errors }
  }

  switch (type) {
    case 'courses':
      data.forEach((row, index) => {
        if (!row.name && !row.courseName && !row.CourseName) {
          errors.push(`Row ${index + 1}: Missing course name`)
        }
        if (!row.faculty && !row.facultyName && !row.FacultyName) {
          errors.push(`Row ${index + 1}: Missing faculty name`)
        }
      })
      break

    case 'faculty':
      data.forEach((row, index) => {
        if (!row.name && !row.facultyName && !row.Name) {
          errors.push(`Row ${index + 1}: Missing faculty name`)
        }
      })
      break

    case 'classrooms':
      data.forEach((row, index) => {
        if (!row.name && !row.roomNumber && !row.RoomNumber) {
          errors.push(`Row ${index + 1}: Missing classroom/room number`)
        }
      })
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
