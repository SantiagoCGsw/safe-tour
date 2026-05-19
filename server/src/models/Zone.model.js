import mongoose from 'mongoose'

const zoneSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  tipo: { type: String, enum: ['turistica', 'cultural', 'peligrosa', 'segura'], required: true },
  nivelSeguridad: { type: Number, min: 1, max: 5 },
  coordenadas: [{
    lat: { type: Number },
    lng: { type: Number }
  }],
  activo: { type: Boolean, default: true }
}, { timestamps: true })

export default mongoose.model('Zone', zoneSchema)