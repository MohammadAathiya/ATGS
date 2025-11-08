import express from 'express'
import Timetable from '../models/Timetable.js'
import PDFDocument from 'pdfkit'

const router = express.Router()

router.get('/csv', async (_req, res) => {
  const doc = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  const rows = doc?.entries || []
  const header = 'Day,Start,End,CourseCode,CourseName,Faculty,Room,Section,Department,Semester\n'
  const body = rows
    .map(e => [e.day,e.start,e.end,e.courseCode,e.courseName,e.faculty,e.classroom,e.section,e.department,e.semester].join(','))
    .join('\n')
  const csv = header + body
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="timetable.csv"')
  res.send(csv)
})

router.get('/pdf', async (_req, res) => {
  const doc = await Timetable.findOne().sort({ createdAt: -1 }).lean()
  const rows = doc?.entries || []
  const pdf = new PDFDocument({ margin: 40 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="timetable.pdf"')
  pdf.pipe(res)
  pdf.fontSize(18).text('ATGS Timetable', { align: 'center' })
  pdf.moveDown()
  pdf.fontSize(10)
  rows.slice(0, 500).forEach((e) => {
    pdf.text(`${e.day} ${e.start}-${e.end} | ${e.courseCode} ${e.courseName} | ${e.faculty} | ${e.classroom} | ${e.section} | Sem ${e.semester}`)
  })
  pdf.end()
})

export default router
