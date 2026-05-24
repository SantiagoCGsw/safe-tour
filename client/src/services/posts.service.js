import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

export const obtenerPosts = () =>
  axios.get(`${API}/api/posts`)

export const crearPost = (datos) =>
  axios.post(`${API}/api/posts`, datos, authHeader())

export const comentarPost = (id, texto) =>
  axios.post(`${API}/api/posts/${id}/comentarios`, { texto }, authHeader())

export const darLike = (id) =>
  axios.put(`${API}/api/posts/${id}/like`, {}, authHeader())

export const eliminarPost = (id) =>
  axios.delete(`${API}/api/posts/${id}`, authHeader())
