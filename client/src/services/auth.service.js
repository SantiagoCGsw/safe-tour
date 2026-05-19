import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export const registrarUsuario = (datos) =>
  axios.post(`${API}/api/auth/register`, datos)

export const loginUsuario = (datos) =>
  axios.post(`${API}/api/auth/login`, datos)