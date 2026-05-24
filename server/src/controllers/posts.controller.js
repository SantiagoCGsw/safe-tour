import Post from '../models/Post.model.js'

export const listarPosts = async (req, res) => {
  try {
    const posts = await Post.find({ activo: true })
      .populate('autor', 'nombre fotoPerfil')
      .populate('comentarios.autor', 'nombre fotoPerfil')
      .sort({ createdAt: -1 })
    res.json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const crearPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, autor: req.user._id })
    await post.populate('autor', 'nombre fotoPerfil')
    res.status(201).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const agregarComentario = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post no encontrado' })

    post.comentarios.push({ autor: req.user._id, texto: req.body.texto })
    await post.save()
    await post.populate('comentarios.autor', 'nombre fotoPerfil')
    res.json(post)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const darLike = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    )
    if (!post) return res.status(404).json({ message: 'Post no encontrado' })
    res.json({ likes: post.likes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const eliminarPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post no encontrado' })

    const esAutor = post.autor.toString() === req.user._id.toString()
    const esModerador = ['gestor', 'admin'].includes(req.user.rol)

    if (!esAutor && !esModerador) {
      return res.status(403).json({ message: 'Sin permisos para eliminar este post' })
    }

    post.activo = false
    await post.save()
    res.json({ message: 'Post eliminado' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}