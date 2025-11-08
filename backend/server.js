import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import cors from 'cors'
import morgan from 'morgan'
import { Server as SocketIOServer } from 'socket.io'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import facultyRoutes from './src/routes/facultyRoutes.js'
import courseRoutes from './src/routes/courseRoutes.js'
import roomRoutes from './src/routes/roomRoutes.js'
import timetableRoutes from './src/routes/timetableRoutes.js'
import uploadRoutes from './src/routes/uploadRoutes.js'
import reportsRoutes from './src/routes/reportsRoutes.js'
import exportRoutes from './src/routes/exportRoutes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] }
})

app.set('io', io)

// Middleware
app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(morgan('dev'))

// Health
app.get('/health', (_req, res) => res.json({ ok: true }))

// Routes mounted under a shared router to support both /api and /api/api (frontend path quirk)
const router = express.Router()
router.use('/auth', authRoutes)
router.use('/faculty', facultyRoutes)
router.use('/courses', courseRoutes)
router.use('/rooms', roomRoutes)
router.use('/timetable', timetableRoutes)
router.use('/upload', uploadRoutes)
router.use('/export', exportRoutes)
router.use('/reports', reportsRoutes)

app.use('/api', router)
app.use('/api/api', router)

const PORT = process.env.PORT || 4000

async function start() {
  await connectDB()
  server.listen(PORT, () => console.log(`ATGS backend running on :${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
