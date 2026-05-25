import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import reportsRoutes from './routes/reports.routes.js'
import usersRoutes from './routes/users.routes.js'
import zonesRoutes from './routes/zones.routes.js'
import postsRoutes from './routes/posts.routes.js'
import adminRoutes from './routes/admin.routes.js'

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    const permitidos = [
      'https://safe-tour-ten.vercel.app',
      'http://localhost:5173'
    ]
    // Permite cualquier subdominio de vercel.app del proyecto
    if (
      !origin ||
      permitidos.includes(origin) ||
      /^https:\/\/safe-tour-.*\.vercel\.app$/.test(origin)
    ) {
      callback(null, true)
    } else {
      callback(new Error('CORS no permitido: ' + origin))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/zones', zonesRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/', (req, res) => res.json({ message: 'Safe Tour API corriendo' }))

export default app