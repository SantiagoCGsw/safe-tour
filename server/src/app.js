import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import usersRoutes from './routes/users.routes.js'
import zonesRoutes from './routes/zones.routes.js'

const app = express()

app.use(cors({
  origin: [
    'https://safe-tour-ten.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/zones', zonesRoutes)

app.get('/', (req, res) => res.json({ message: 'Safe Tour API corriendo' }))

export default app