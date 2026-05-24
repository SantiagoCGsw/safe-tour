import { Router } from 'express'
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js'
import {
  listarPosts,
  crearPost,
  agregarComentario,
  darLike,
  eliminarPost
} from '../controllers/posts.controller.js'

const router = Router()

router.get('/', listarPosts)
router.post('/', protect, crearPost)
router.post('/:id/comentarios', protect, agregarComentario)
router.put('/:id/like', protect, darLike)
router.delete('/:id', protect, eliminarPost)

export default router