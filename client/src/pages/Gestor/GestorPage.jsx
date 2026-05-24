import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { obtenerReportes, eliminarReporte } from '../../services/reports.service'
import { obtenerZonas, crearZona, eliminarZona } from '../../services/zones.service'

function GestorPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('reportes')
  const [reportes, setReportes] = useState([])
  const [zonas, setZonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  const [nuevaZona, setNuevaZona] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'turistica',
    nivelSeguridad: 3,
  })
  const [creandoZona, setCreandoZona] = useState(false)
  const [guardandoZona, setGuardandoZona] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [rRes, zRes] = await Promise.all([
        obtenerReportes(),
        obtenerZonas(),
      ])
      setReportes(rRes.data)
      setZonas(zRes.data)
    } catch {
      mostrarMensaje('error', 'Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleEliminarReporte = async (id) => {
    try {
      await eliminarReporte(id)
      setReportes(prev => prev.filter(r => r._id !== id))
      mostrarMensaje('ok', 'Reporte eliminado')
    } catch {
      mostrarMensaje('error', 'No se pudo eliminar el reporte')
    }
  }

  const handleCrearZona = async () => {
    if (!nuevaZona.nombre.trim()) {
      mostrarMensaje('error', 'El nombre es obligatorio')
      return
    }
    setGuardandoZona(true)
    try {
      const { data } = await crearZona(nuevaZona)
      setZonas(prev => [...prev, data])
      setNuevaZona({ nombre: '', descripcion: '', tipo: 'turistica', nivelSeguridad: 3 })
      setCreandoZona(false)
      mostrarMensaje('ok', 'Zona creada')
    } catch {
      mostrarMensaje('error', 'No se pudo crear la zona')
    } finally {
      setGuardandoZona(false)
    }
  }

  const handleEliminarZona = async (id) => {
    try {
      await eliminarZona(id)
      setZonas(prev => prev.filter(z => z._id !== id))
      mostrarMensaje('ok', 'Zona eliminada')
    } catch {
      mostrarMensaje('error', 'No se pudo eliminar la zona')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const nivelColor = (n) => {
    if (n <= 2) return '#ef4444'
    if (n === 3) return '#f59e0b'
    return '#10b981'
  }

  const tipoIcono = {
    accidente: '⚠️',
    robo: '🚨',
    obra: '🚧',
    peligro: '⛔',
    turismo: '📍',
    turistica: '🏛️',
    cultural: '🎭',
    peligrosa: '🔴',
    segura: '🟢',
  }

  if (cargando) {
    return (
      <div style={s.root}>
        <div style={s.bg} />
        <div style={s.centro}>
          <div style={s.spinner} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={s.root}>
      <div style={s.bg} />

      <nav style={s.navbar}>
        <button style={s.botonNav} onClick={() => navigate('/mapa')}>
          ← Mapa
        </button>
        <span style={s.navMarca}>Panel Gestor</span>
        <div style={s.navRight}>
          <span style={s.navRol}>{usuario?.nombre}</span>
          <button style={s.botonSalir} onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      <div style={s.contenido}>

        {mensaje && (
          <div style={{
            ...s.mensaje,
            background: mensaje.tipo === 'ok' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            border: `1px solid ${mensaje.tipo === 'ok' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
            color: mensaje.tipo === 'ok' ? '#10b981' : '#ef4444',
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* Tabs */}
        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(tab === 'reportes' ? s.tabActivo : {}) }}
            onClick={() => setTab('reportes')}
          >
            Reportes ({reportes.length})
          </button>
          <button
            style={{ ...s.tab, ...(tab === 'zonas' ? s.tabActivo : {}) }}
            onClick={() => setTab('zonas')}
          >
            Zonas ({zonas.length})
          </button>
        </div>

        {/* Tab reportes */}
        {tab === 'reportes' && (
          <div style={s.lista}>
            {reportes.length === 0 && (
              <p style={s.vacio}>No hay reportes activos</p>
            )}
            {reportes.map(r => (
              <div key={r._id} style={s.item}>
                <div style={s.itemLeft}>
                  <span style={s.itemIcono}>{tipoIcono[r.tipo] || '📌'}</span>
                  <div style={s.itemInfo}>
                    <p style={s.itemTitulo}>{r.titulo}</p>
                    <p style={s.itemSub}>
                      {r.tipo} · {r.autor?.nombre || 'Anónimo'} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                    </p>
                    {r.descripcion && (
                      <p style={s.itemDesc}>{r.descripcion}</p>
                    )}
                  </div>
                </div>
                <button
                  style={s.botonEliminar}
                  onClick={() => handleEliminarReporte(r._id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab zonas */}
        {tab === 'zonas' && (
          <div style={s.lista}>

            {!creandoZona ? (
              <button style={s.botonCrear} onClick={() => setCreandoZona(true)}>
                + Nueva zona
              </button>
            ) : (
              <div style={s.formZona}>
                <p style={s.formTitulo}>Nueva zona</p>

                <input
                  style={s.input}
                  placeholder="Nombre *"
                  value={nuevaZona.nombre}
                  onChange={e => setNuevaZona({ ...nuevaZona, nombre: e.target.value })}
                />

                <input
                  style={s.input}
                  placeholder="Descripción"
                  value={nuevaZona.descripcion}
                  onChange={e => setNuevaZona({ ...nuevaZona, descripcion: e.target.value })}
                />

                <select
                  style={s.input}
                  value={nuevaZona.tipo}
                  onChange={e => setNuevaZona({ ...nuevaZona, tipo: e.target.value })}
                >
                  <option value="turistica">Turística</option>
                  <option value="cultural">Cultural</option>
                  <option value="peligrosa">Peligrosa</option>
                  <option value="segura">Segura</option>
                </select>

                <div style={s.nivelWrap}>
                  <label style={s.nivelLabel}>
                    Nivel de seguridad: <span style={{ color: nivelColor(nuevaZona.nivelSeguridad), fontWeight: 600 }}>{nuevaZona.nivelSeguridad}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={nuevaZona.nivelSeguridad}
                    onChange={e => setNuevaZona({ ...nuevaZona, nivelSeguridad: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: nivelColor(nuevaZona.nivelSeguridad) }}
                  />
                  <div style={s.nivelDesc}>
                    <span>1 — Mayor riesgo</span>
                    <span>5 — Más seguro</span>
                  </div>
                </div>

                <div style={s.botonesRow}>
                  <button
                    style={s.botonCancelar}
                    onClick={() => setCreandoZona(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    style={{ ...s.botonGuardar, opacity: guardandoZona ? 0.7 : 1 }}
                    onClick={handleCrearZona}
                    disabled={guardandoZona}
                  >
                    {guardandoZona ? 'Guardando...' : 'Crear zona'}
                  </button>
                </div>
              </div>
            )}

            {zonas.length === 0 && (
              <p style={s.vacio}>No hay zonas registradas</p>
            )}

            {zonas.map(z => (
              <div key={z._id} style={s.item}>
                <div style={s.itemLeft}>
                  <span style={s.itemIcono}>{tipoIcono[z.tipo] || '📍'}</span>
                  <div style={s.itemInfo}>
                    <p style={s.itemTitulo}>{z.nombre}</p>
                    <p style={s.itemSub}>
                      {z.tipo} · Seguridad:&nbsp;
                      <span style={{ color: nivelColor(z.nivelSeguridad), fontWeight: 600 }}>
                        {z.nivelSeguridad}/5
                      </span>
                    </p>
                    {z.descripcion && (
                      <p style={s.itemDesc}>{z.descripcion}</p>
                    )}
                  </div>
                </div>
                <button
                  style={s.botonEliminar}
                  onClick={() => handleEliminarZona(z._id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(200,220,255,0.35); }
        select { color: #e8f4ff; }
      `}</style>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  bg: { position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#020b18 0%,#051832 40%,#071e3d 100%)', zIndex: 0 },
  navbar: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', height: '58px', background: 'rgba(5,18,40,0.95)', borderBottom: '1px solid rgba(100,180,255,0.1)' },
  navMarca: { color: '#fff', fontWeight: '700', fontSize: '1rem' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  navRol: { color: 'rgba(160,200,255,0.6)', fontSize: '0.85rem' },
  botonNav: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(100,180,255,0.12)', color: '#64b4ff', cursor: 'pointer', fontSize: '13px' },
  botonSalir: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer', fontSize: '13px' },
  contenido: { position: 'relative', zIndex: 10, flex: 1, maxWidth: '760px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  mensaje: { padding: '10px 16px', borderRadius: '10px', fontSize: '0.88rem', textAlign: 'center' },
  tabs: { display: 'flex', gap: '8px', borderBottom: '1px solid rgba(100,180,255,0.1)', paddingBottom: '0' },
  tab: { padding: '10px 20px', borderRadius: '10px 10px 0 0', border: 'none', background: 'transparent', color: 'rgba(160,200,255,0.55)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' },
  tabActivo: { background: 'rgba(100,180,255,0.12)', color: '#64b4ff', borderBottom: '2px solid #64b4ff' },
  lista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  vacio: { textAlign: 'center', color: 'rgba(160,200,255,0.35)', padding: '2rem 0', margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', background: 'rgba(5,18,40,0.7)', border: '1px solid rgba(100,180,255,0.1)', borderRadius: '12px', padding: '14px 16px' },
  itemLeft: { display: 'flex', gap: '12px', flex: 1, minWidth: 0 },
  itemIcono: { fontSize: '1.4rem', flexShrink: 0 },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  itemTitulo: { margin: 0, color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  itemSub: { margin: 0, color: 'rgba(160,200,255,0.55)', fontSize: '0.8rem' },
  itemDesc: { margin: 0, color: 'rgba(160,200,255,0.45)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  botonEliminar: { padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0 },
  botonCrear: { padding: '12px', borderRadius: '10px', border: '1px dashed rgba(100,180,255,0.3)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'center' },
  formZona: { background: 'rgba(5,18,40,0.7)', border: '1px solid rgba(100,180,255,0.15)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' },
  formTitulo: { margin: 0, color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  input: { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', background: 'rgba(10,25,60,0.8)', color: '#e8f4ff', fontSize: '0.9rem', outline: 'none' },
  nivelWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  nivelLabel: { color: 'rgba(160,200,255,0.7)', fontSize: '0.85rem' },
  nivelDesc: { display: 'flex', justifyContent: 'space-between', color: 'rgba(160,200,255,0.4)', fontSize: '0.75rem' },
  botonesRow: { display: 'flex', gap: '10px' },
  botonCancelar: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.88rem' },
  botonGuardar: { flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#1565c0,#0d47a1)', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' },
  centro: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(100,180,255,0.2)', borderTop: '3px solid #64b4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}

export default GestorPage