import { Router } from 'express'
import Zone from '../models/Zone.model.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const zonas = await Zone.find({ activo: true })
    res.json(zonas)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const zona = await Zone.create(req.body)
    res.status(201).json(zona)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router