import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  titulo:      { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo:        { type: String, enum: ['accidente', 'robo', 'obra', 'peligro', 'turismo'], required: true },
  ubicacion: {
    lat:       { type: Number, required: true },
    lng:       { type: Number, required: true },
    direccion: { type: String }
  },
  autor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votos:  { type: Number, default: 0 },
  activo: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Report', reportSchema)