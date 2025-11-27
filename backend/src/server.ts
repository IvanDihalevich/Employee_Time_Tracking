import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import timeOffRoutes from './routes/timeOff'
import adminRoutes from './routes/admin'
import newsRoutes from './routes/news'
import holidaysRoutes from './routes/holidays'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/time-off', timeOffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/holidays', holidaysRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

