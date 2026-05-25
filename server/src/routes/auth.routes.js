import { Router } from 'express'
import { register, login, crearCuenta } from '../controllers/auth.controller.js'
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/crear-cuenta', protect, authorizeRoles('admin'), crearCuenta)

export default router