import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUsuario } from '../../services/auth.service'
import { useAuth } from '../../context/AuthContext'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const { data } = await loginUsuario(form)
      login(data)
      navigate('/mapa')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.caja}>
        <h1 style={estilos.titulo}>Safe Tour</h1>
        <p style={estilos.subtitulo}>Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit} style={estilos.form}>
          <input
            style={estilos.input}
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            style={estilos.input}
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p style={estilos.error}>{error}</p>}
          <button style={estilos.boton} type="submit" disabled={cargando}>
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={estilos.link}>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

const estilos = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f4f8'
  },
  caja: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '380px'
  },
  titulo: { textAlign: 'center', color: '#1a73e8', marginBottom: '0.25rem' },
  subtitulo: { textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    outline: 'none'
  },
  boton: {
    padding: '0.75rem',
    background: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  error: { color: '#d32f2f', fontSize: '0.85rem', textAlign: 'center' },
  link: { textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }
}

export default Login