import { Router } from 'express'
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'
import {
  listarZonas,
  crearZona,
  actualizarZona,
  eliminarZona
} from '../controllers/zones.controller.js'

const router = Router()

router.get('/', listarZonas)
router.post('/', protect, authorizeRoles('gestor', 'admin'), crearZona)
router.put('/:id', protect, authorizeRoles('gestor', 'admin'), actualizarZona)
router.delete('/:id', protect, authorizeRoles('gestor', 'admin'), eliminarZona)

export default router