import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerReportes = () =>
  axios.get(`${API}/api/reports`)

export const crearReporte = (datos) =>
  axios.post(`${API}/api/reports`, datos, authHeader())

export const eliminarReporte = (id) =>
  axios.delete(`${API}/api/reports/${id}`, authHeader())