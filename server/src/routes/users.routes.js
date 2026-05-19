import { Router } from 'express'
import { getPerfil, updatePerfil } from '../controllers/users.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/perfil', protect, getPerfil)
router.put('/perfil', protect, updatePerfil)

export default router