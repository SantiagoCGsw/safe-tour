import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  contenido: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imagenes: [{ type: String }],
  likes: { type: Number, default: 0 },
  comentarios: [{
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    texto: { type: String },
    fecha: { type: Date, default: Date.now }
  }],
  zona: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone' },
  activo: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Post', postSchema)