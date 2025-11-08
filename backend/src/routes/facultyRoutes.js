import express from 'express'
import Faculty from '../models/Faculty.js'
import { auth, allowRoles } from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, async (_req, res) => {
  const docs = await Faculty.find().lean()
  res.json(docs)
})

router.post('/', auth, allowRoles('Admin'), async (req, res) => {
  const doc = await Faculty.create(req.body)
  req.app.get('io').emit('notify', { type: 'info', message: `Faculty added: ${doc.name}` })
  res.status(201).json(doc)
})

router.put('/:id', auth, allowRoles('Admin'), async (req, res) => {
  const doc = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(doc)
})

router.delete('/:id', auth, allowRoles('Admin'), async (req, res) => {
  await Faculty.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router
