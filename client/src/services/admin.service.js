import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerStats = () =>
  axios.get(`${API}/api/admin/stats`, authHeader())

export const obtenerUsuarios = () =>
  axios.get(`${API}/api/admin/usuarios`, authHeader())

export const cambiarRol = (id, rol) =>
  axios.put(`${API}/api/admin/usuarios/${id}/rol`, { rol }, authHeader())