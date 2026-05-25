import User from '../models/User.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js'

export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    const existe = await User.findOne({ email })
    if (existe) return res.status(400).json({ message: 'El correo ya está registrado' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ nombre, email, password: hash, rol: 'turista' })

    res.status(201).json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' })

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Solo admin — crea turistas, gestores o admins
export const crearCuenta = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body

    if (!['turista', 'gestor', 'admin'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' })
    }

    const existe = await User.findOne({ email })
    if (existe) return res.status(400).json({ message: 'El correo ya está registrado' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ nombre, email, password: hash, rol })

    res.status(201).json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}