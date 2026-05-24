import { Router } from 'express'
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'
import User from '../models/User.model.js'
import Report from '../models/Report.model.js'
import Zone from '../models/Zone.model.js'
import Post from '../models/Post.model.js'

const router = Router()

router.get('/stats', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const [usuarios, reportes, zonas, posts] = await Promise.all([
      User.countDocuments({ activo: true }),
      Report.countDocuments({ activo: true }),
      Zone.countDocuments({ activo: true }),
      Post.countDocuments({ activo: true })
    ])

    const reportesPorTipo = await Report.aggregate([
      { $match: { activo: true } },
      { $group: { _id: '$tipo', total: { $sum: 1 } } }
    ])

    res.json({ usuarios, reportes, zonas, posts, reportesPorTipo })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/usuarios', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const usuarios = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/usuarios/:id/rol', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { rol } = req.body
    if (!['turista', 'gestor', 'admin'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' })
    }
    const usuario = await User.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    ).select('-password')
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router