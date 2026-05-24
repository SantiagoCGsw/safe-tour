import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerZonas = () =>
  axios.get(`${API}/api/zones`)

export const crearZona = (datos) =>
  axios.post(`${API}/api/zones`, datos, authHeader())

export const actualizarZona = (id, datos) =>
  axios.put(`${API}/api/zones/${id}`, datos, authHeader())

export const eliminarZona = (id) =>
  axios.delete(`${API}/api/zones/${id}`, authHeader())