import User from '../models/User.model.js'

export const getPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePerfil = async (req, res) => {
  try {
    const { nombre, fotoPerfil } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nombre, fotoPerfil },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}