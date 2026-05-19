import Report from '../models/Report.model.js'

export const crearReporte = async (req, res) => {
  try {
    const { titulo, descripcion, tipo, ubicacion } = req.body
    const reporte = await Report.create({
      titulo, descripcion, tipo, ubicacion,
      autor: req.user._id
    })
    res.status(201).json(reporte)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReportes = async (req, res) => {
  try {
    const reportes = await Report.find({ activo: true })
      .populate('autor', 'nombre email')
      .sort({ createdAt: -1 })
    res.json(reportes)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReportePorId = async (req, res) => {
  try {
    const reporte = await Report.findById(req.params.id)
      .populate('autor', 'nombre email')
    if (!reporte) return res.status(404).json({ message: 'Reporte no encontrado' })
    res.json(reporte)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const eliminarReporte = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { activo: false })
    res.json({ message: 'Reporte eliminado' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}