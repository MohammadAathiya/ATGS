import express from 'express'
import Course from '../models/Course.js'
import { auth, allowRoles } from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, async (_req, res) => {
  const docs = await Course.find().lean()
  res.json(docs)
})

router.post('/', auth, allowRoles('Admin'), async (req, res) => {
  const doc = await Course.create(req.body)
  req.app.get('io').emit('notify', { type: 'info', message: `Course added: ${doc.code}` })
  res.status(201).json(doc)
})

router.put('/:id', auth, allowRoles('Admin'), async (req, res) => {
  const doc = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(doc)
})

router.delete('/:id', auth, allowRoles('Admin'), async (req, res) => {
  await Course.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router
