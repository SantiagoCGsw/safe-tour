import { Router } from 'express'
import { crearReporte, getReportes, getReportePorId, eliminarReporte } from '../controllers/reports.controller.js'
import { protect } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getReportes)
router.get('/:id', getReportePorId)
router.post('/', protect, crearReporte)
router.delete('/:id', protect, eliminarReporte)

export default router