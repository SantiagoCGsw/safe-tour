import Zone from '../models/Zone.model.js'

export const listarZonas = async (req, res) => {
  try {
    const zonas = await Zone.find({ activo: true })
    res.json(zonas)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const crearZona = async (req, res) => {
  try {
    const zona = await Zone.create(req.body)
    res.status(201).json(zona)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const actualizarZona = async (req, res) => {
  try {
    const zona = await Zone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!zona) return res.status(404).json({ message: 'Zona no encontrada' })
    res.json(zona)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const eliminarZona = async (req, res) => {
  try {
    const zona = await Zone.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    )
    if (!zona) return res.status(404).json({ message: 'Zona no encontrada' })
    res.json({ message: 'Zona desactivada' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}