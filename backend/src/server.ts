import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import timeOffRoutes from './routes/timeOff'
import adminRoutes from './routes/admin'
import newsRoutes from './routes/news'
import holidaysRoutes from './routes/holidays'
import hierarchyRoutes from './routes/hierarchy'

dotenv.config()

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production')
  process.exit(1)
}

const app = express()
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}
const PORT = process.env.PORT || 5000

const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    const isLocalhost =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
    if (process.env.NODE_ENV !== 'production' && isLocalhost) {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ ok: true, health: '/api/health' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/time-off', timeOffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/holidays', holidaysRoutes)
app.use('/api/hierarchy', hierarchyRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

