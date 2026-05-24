import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

function ProfilePage() {
  const { usuario, login, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ nombre: '', fotoPerfil: '' })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/users/perfil`, authHeader())
      .then(({ data }) => {
        setForm({ nombre: data.nombre, fotoPerfil: data.fotoPerfil || '' })
        setCargando(false)
      })
      .catch(() => {
        setCargando(false)
      })
  }, [])

  const handleGuardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const { data } = await axios.put(`${API}/api/users/perfil`, form, authHeader())
      login({ ...usuario, nombre: data.nombre, fotoPerfil: data.fotoPerfil })
      setMensaje({ tipo: 'ok', texto: 'Perfil actualizado' })
      setEditando(false)
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar' })
    } finally {
      setGuardando(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials =
    form.nombre
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'

  const rolColor = {
    admin: '#f59e0b',
    gestor: '#3b82f6',
    turista: '#10b981',
  }

  if (cargando) {
    return (
      <div style={s.root}>
        <div style={s.bg} />
        <div style={s.centro}>
          <div style={s.spinner} />
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <div style={s.bg} />

      <nav style={s.navbar}>
        <button style={s.botonNav} onClick={() => navigate('/mapa')}>
          ← Volver al mapa
        </button>
        <span style={s.navMarca}>Safe Tour</span>
        <button style={s.botonSalir} onClick={handleLogout}>
          Salir
        </button>
      </nav>

      <div style={s.contenido}>
        <div style={s.card}>

          {/* Avatar */}
          <div style={s.avatarWrap}>
            {form.fotoPerfil ? (
              <img src={form.fotoPerfil} alt="perfil" style={s.avatarImg} />
            ) : (
              <div style={s.avatarLetras}>{initials}</div>
            )}
            <div style={{
              ...s.rolBadge,
              background: `${rolColor[usuario?.rol] || '#6366f1'}22`,
              color: rolColor[usuario?.rol] || '#6366f1',
              border: `1px solid ${rolColor[usuario?.rol] || '#6366f1'}55`,
            }}>
              {usuario?.rol}
            </div>
          </div>

          {/* Info */}
          <div style={s.seccion}>
            <p style={s.label}>Correo electrónico</p>
            <p style={s.valor}>{usuario?.email}</p>
          </div>

          {/* Formulario */}
          <div style={s.seccion}>
            <div style={s.seccionHeader}>
              <p style={s.label}>Nombre</p>
              {!editando && (
                <button style={s.botonEditar} onClick={() => setEditando(true)}>
                  Editar
                </button>
              )}
            </div>

            {editando ? (
              <input
                style={s.input}
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                autoFocus
              />
            ) : (
              <p style={s.valor}>{form.nombre}</p>
            )}
          </div>

          <div style={s.seccion}>
            <p style={s.label}>URL de foto de perfil</p>
            {editando ? (
              <input
                style={s.input}
                value={form.fotoPerfil}
                onChange={e => setForm({ ...form, fotoPerfil: e.target.value })}
                placeholder="https://..."
              />
            ) : (
              <p style={{ ...s.valor, color: form.fotoPerfil ? '#64b4ff' : 'rgba(160,200,255,0.35)', fontSize: '0.83rem', wordBreak: 'break-all' }}>
                {form.fotoPerfil || 'Sin foto'}
              </p>
            )}
          </div>

          {/* Mensaje */}
          {mensaje && (
            <div style={{
              ...s.mensaje,
              background: mensaje.tipo === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: mensaje.tipo === 'ok' ? '#10b981' : '#ef4444',
            }}>
              {mensaje.texto}
            </div>
          )}

          {/* Botones */}
          {editando && (
            <div style={s.botonesRow}>
              <button
                style={s.botonCancelar}
                onClick={() => {
                  setEditando(false)
                  setMensaje(null)
                }}
              >
                Cancelar
              </button>
              <button
                style={{ ...s.botonGuardar, opacity: guardando ? 0.7 : 1 }}
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(200,220,255,0.35); }
      `}</style>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  bg: { position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#020b18 0%,#051832 40%,#071e3d 100%)', zIndex: 0 },
  navbar: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', height: '58px', background: 'rgba(5,18,40,0.95)', borderBottom: '1px solid rgba(100,180,255,0.1)' },
  navMarca: { color: '#fff', fontWeight: '700', fontSize: '1rem' },
  botonNav: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(100,180,255,0.12)', color: '#64b4ff', cursor: 'pointer', fontSize: '13px' },
  botonSalir: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer', fontSize: '13px' },
  contenido: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 1rem' },
  card: { width: '100%', maxWidth: '460px', background: 'rgba(5,18,40,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(100,180,255,0.15)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  avatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  avatarImg: { width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(100,180,255,0.3)' },
  avatarLetras: { width: '88px', height: '88px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', color: '#fff', border: '3px solid rgba(100,180,255,0.3)' },
  rolBadge: { padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  seccion: { display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid rgba(100,180,255,0.08)', paddingBottom: '1.25rem' },
  seccionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { margin: 0, fontSize: '0.75rem', fontWeight: '600', color: 'rgba(160,200,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  valor: { margin: 0, fontSize: '0.97rem', color: '#e8f4ff' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.25)', background: 'rgba(10,25,60,0.7)', color: '#e8f4ff', fontSize: '0.95rem', outline: 'none' },
  botonEditar: { padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(100,180,255,0.25)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.8rem' },
  mensaje: { padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', textAlign: 'center' },
  botonesRow: { display: 'flex', gap: '10px' },
  botonCancelar: { flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.9rem' },
  botonGuardar: { flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#1565c0,#0d47a1)', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  centro: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(100,180,255,0.2)', borderTop: '3px solid #64b4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}

export default ProfilePage