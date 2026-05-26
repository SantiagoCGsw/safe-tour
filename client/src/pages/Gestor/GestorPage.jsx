import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useAuth } from '../../context/AuthContext'
import { obtenerReportes, eliminarReporte } from '../../services/reports.service'
import { obtenerZonas, crearZona, eliminarZona } from '../../services/zones.service'

const TILE_URL  = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO'
const BOGOTA    = [4.711, -74.0721]

const coloresPorTipo = {
  turistica: '#3b82f6',
  cultural:  '#8b5cf6',
  peligrosa: '#ef4444',
  segura:    '#10b981',
}

const iconoPunto = L.divIcon({
  className: '',
  html: '<div style="width:10px;height:10px;border-radius:50%;background:#1565c0;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
  iconSize: [10, 10], iconAnchor: [5, 5],
})

function DibujarPoligono({ activo, setPuntos }) {
  useMapEvents({
    click(e) {
      if (!activo) return
      setPuntos(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
    },
  })
  return null
}

function MapaZona({ puntos, setPuntos, tipo, dibujando }) {
  const color = coloresPorTipo[tipo] || '#3b82f6'
  return (
    <MapContainer center={BOGOTA} zoom={13} style={{ width: '100%', height: '300px', borderRadius: '12px' }} zoomControl={false}>
      <ZoomControl position="bottomleft" />
      <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
      <DibujarPoligono activo={dibujando} setPuntos={setPuntos} />
      {puntos.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={iconoPunto} />
      ))}
      {puntos.length >= 3 && (
        <Polygon
          positions={puntos.map(p => [p.lat, p.lng])}
          pathOptions={{ color, fillColor: color, fillOpacity: 0.2, weight: 2 }}
        />
      )}
    </MapContainer>
  )
}

function GestorPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]           = useState('reportes')
  const [reportes, setReportes] = useState([])
  const [zonas, setZonas]       = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje]   = useState(null)
  const [sidebarAbierto, setSidebarAbierto] = useState(true)

  const [creandoZona, setCreandoZona]     = useState(false)
  const [dibujando, setDibujando]         = useState(false)
  const [guardandoZona, setGuardandoZona] = useState(false)
  const [puntos, setPuntos]               = useState([])
  const [nuevaZona, setNuevaZona]         = useState({
    nombre: '', descripcion: '', tipo: 'turistica', nivelSeguridad: 3,
  })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [rRes, zRes] = await Promise.all([obtenerReportes(), obtenerZonas()])
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
    } catch { mostrarMensaje('error', 'No se pudo eliminar') }
  }

  const handleCrearZona = async () => {
    if (!nuevaZona.nombre.trim()) return mostrarMensaje('error', 'El nombre es obligatorio')
    if (puntos.length < 3) return mostrarMensaje('error', 'Dibuja al menos 3 puntos en el mapa')
    setGuardandoZona(true)
    try {
      const { data } = await crearZona({ ...nuevaZona, coordenadas: puntos })
      setZonas(prev => [...prev, data])
      setNuevaZona({ nombre: '', descripcion: '', tipo: 'turistica', nivelSeguridad: 3 })
      setPuntos([])
      setCreandoZona(false)
      setDibujando(false)
      mostrarMensaje('ok', 'Zona creada')
    } catch { mostrarMensaje('error', 'No se pudo crear la zona') }
    finally { setGuardandoZona(false) }
  }

  const handleEliminarZona = async (id) => {
    try {
      await eliminarZona(id)
      setZonas(prev => prev.filter(z => z._id !== id))
      mostrarMensaje('ok', 'Zona eliminada')
    } catch { mostrarMensaje('error', 'No se pudo eliminar') }
  }

  const cancelarZona = () => {
    setCreandoZona(false)
    setDibujando(false)
    setPuntos([])
    setNuevaZona({ nombre: '', descripcion: '', tipo: 'turistica', nivelSeguridad: 3 })
  }

  const nivelColor = (n) => n <= 2 ? '#ef4444' : n === 3 ? '#f59e0b' : '#10b981'

  const tipoIcono = {
    accidente: '⚠️', robo: '🚨', obra: '🚧', peligro: '⛔', turismo: '📍',
    turistica: '🏛️', cultural: '🎭', peligrosa: '🔴', segura: '🟢',
  }

  const navItems = [
    { id: 'reportes', label: 'Reportes', icono: '📋', count: reportes.length },
    { id: 'zonas',    label: 'Zonas',    icono: '🗺️', count: zonas.length },
  ]

  if (cargando) return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.centro}><div style={s.spinner} /></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={s.root}>
      <div style={s.bg} />

      {/* Layout principal */}
      <div style={s.layout}>

        {/* Sidebar */}
        <aside style={{ ...s.sidebar, width: sidebarAbierto ? '220px' : '64px' }}>
          <div style={s.sidebarHeader}>
            {sidebarAbierto && <span style={s.sidebarMarca}>Safe Tour</span>}
            <button style={s.toggleBtn} onClick={() => setSidebarAbierto(p => !p)}>
              {sidebarAbierto ? '◀' : '▶'}
            </button>
          </div>

          <nav style={s.sidebarNav}>
            {navItems.map(item => (
              <button
                key={item.id}
                style={{ ...s.navItem, ...(tab === item.id ? s.navItemActivo : {}) }}
                onClick={() => setTab(item.id)}
                title={item.label}
              >
                <span style={s.navIcono}>{item.icono}</span>
                {sidebarAbierto && (
                  <span style={s.navLabel}>
                    {item.label}
                    <span style={s.navCount}>{item.count}</span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div style={s.sidebarFooter}>
            <button
              style={s.navItem}
              onClick={() => navigate('/mapa')}
              title="Volver al mapa"
            >
              <span style={s.navIcono}>🗺️</span>
              {sidebarAbierto && <span style={s.navLabel}>Mapa</span>}
            </button>
            <button
              style={{ ...s.navItem, color: '#ef4444' }}
              onClick={() => { logout(); navigate('/login') }}
              title="Salir"
            >
              <span style={s.navIcono}>🚪</span>
              {sidebarAbierto && <span style={s.navLabel}>Salir</span>}
            </button>
          </div>

          {sidebarAbierto && (
            <div style={s.sidebarUser}>
              <div style={s.userAvatar}>
                {usuario?.nombre?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={s.userName}>{usuario?.nombre}</p>
                <p style={s.userRol}>{usuario?.rol}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Contenido principal */}
        <main style={s.main}>

          {/* Topbar */}
          <div style={s.topbar}>
            <h1 style={s.topbarTitulo}>
              {tab === 'reportes' ? 'Gestión de reportes' : 'Gestión de zonas'}
            </h1>
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
          </div>

          <div style={s.contenido}>

            {/* ── Tab reportes ── */}
            {tab === 'reportes' && (
              <div style={s.lista}>
                {reportes.length === 0 && <p style={s.vacio}>No hay reportes activos</p>}
                {reportes.map(r => (
                  <div key={r._id} style={s.item}>
                    <div style={s.itemLeft}>
                      <span style={s.itemIcono}>{tipoIcono[r.tipo] || '📌'}</span>
                      <div style={s.itemInfo}>
                        <p style={s.itemTitulo}>{r.titulo}</p>
                        <p style={s.itemSub}>
                          {r.tipo} · {r.autor?.nombre || 'Anónimo'} · {new Date(r.createdAt).toLocaleDateString('es-CO')}
                        </p>
                        {r.descripcion && <p style={s.itemDesc}>{r.descripcion}</p>}
                      </div>
                    </div>
                    <button style={s.botonEliminar} onClick={() => handleEliminarReporte(r._id)}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tab zonas ── */}
            {tab === 'zonas' && (
              <div style={s.lista}>
                {!creandoZona ? (
                  <button style={s.botonCrear} onClick={() => setCreandoZona(true)}>
                    + Nueva zona
                  </button>
                ) : (
                  <div style={s.formZona}>
                    <p style={s.formTitulo}>Nueva zona</p>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={s.nivelLabel}>
                          {dibujando
                            ? `Haz clic en el mapa (${puntos.length} punto${puntos.length !== 1 ? 's' : ''})`
                            : 'Dibuja el área en el mapa'}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {puntos.length > 0 && (
                            <button style={s.botonMini} onClick={() => setPuntos(p => p.slice(0, -1))}>
                              ↩
                            </button>
                          )}
                          <button
                            style={{
                              ...s.botonMini,
                              background: dibujando ? 'rgba(239,68,68,0.15)' : 'rgba(100,180,255,0.15)',
                              color: dibujando ? '#ef4444' : '#64b4ff',
                            }}
                            onClick={() => setDibujando(p => !p)}
                          >
                            {dibujando ? '⏸' : '✏️'}
                          </button>
                        </div>
                      </div>
                      <MapaZona puntos={puntos} setPuntos={setPuntos} tipo={nuevaZona.tipo} dibujando={dibujando} />
                      {puntos.length > 0 && puntos.length < 3 && (
                        <p style={{ margin: '6px 0 0', color: '#f59e0b', fontSize: '0.78rem' }}>
                          Necesitas al menos 3 puntos
                        </p>
                      )}
                      {puntos.length >= 3 && (
                        <p style={{ margin: '6px 0 0', color: '#10b981', fontSize: '0.78rem' }}>
                          ✓ Polígono listo
                        </p>
                      )}
                    </div>

                    <input style={s.input} placeholder="Nombre *"
                      value={nuevaZona.nombre}
                      onChange={e => setNuevaZona({ ...nuevaZona, nombre: e.target.value })} />

                    <input style={s.input} placeholder="Descripción"
                      value={nuevaZona.descripcion}
                      onChange={e => setNuevaZona({ ...nuevaZona, descripcion: e.target.value })} />

                    <select style={s.input} value={nuevaZona.tipo}
                      onChange={e => setNuevaZona({ ...nuevaZona, tipo: e.target.value })}>
                      <option value="turistica">Turística</option>
                      <option value="cultural">Cultural</option>
                      <option value="peligrosa">Peligrosa</option>
                      <option value="segura">Segura</option>
                    </select>

                    <div style={s.nivelWrap}>
                      <label style={s.nivelLabel}>
                        Seguridad:&nbsp;
                        <span style={{ color: nivelColor(nuevaZona.nivelSeguridad), fontWeight: 600 }}>
                          {nuevaZona.nivelSeguridad}
                        </span>
                      </label>
                      <input type="range" min="1" max="5" value={nuevaZona.nivelSeguridad}
                        onChange={e => setNuevaZona({ ...nuevaZona, nivelSeguridad: Number(e.target.value) })}
                        style={{ width: '100%', accentColor: nivelColor(nuevaZona.nivelSeguridad) }} />
                      <div style={s.nivelDesc}>
                        <span>1 — Mayor riesgo</span>
                        <span>5 — Más seguro</span>
                      </div>
                    </div>

                    <div style={s.botonesRow}>
                      <button style={s.botonCancelar} onClick={cancelarZona}>Cancelar</button>
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

                {zonas.length === 0 && <p style={s.vacio}>No hay zonas registradas</p>}
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
                          &nbsp;· {z.coordenadas?.length || 0} pts
                        </p>
                        {z.descripcion && <p style={s.itemDesc}>{z.descripcion}</p>}
                      </div>
                    </div>
                    <button style={s.botonEliminar} onClick={() => handleEliminarZona(z._id)}>
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
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
  root:    { height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' },
  bg:      { position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#020b18 0%,#051832 40%,#071e3d 100%)', zIndex: 0 },
  layout:  { position: 'relative', zIndex: 10, display: 'flex', flex: 1, overflow: 'hidden' },

  sidebar: {
    display: 'flex', flexDirection: 'column',
    background: 'rgba(5,18,40,0.97)',
    borderRight: '1px solid rgba(100,180,255,0.1)',
    transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 14px', borderBottom: '1px solid rgba(100,180,255,0.08)',
    minHeight: '58px',
  },
  sidebarMarca: { color: '#fff', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' },
  toggleBtn: {
    background: 'rgba(100,180,255,0.1)', border: 'none', color: '#64b4ff',
    width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0,
  },
  sidebarNav:    { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  sidebarFooter: { padding: '8px', borderTop: '1px solid rgba(100,180,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' },
  sidebarUser:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderTop: '1px solid rgba(100,180,255,0.08)' },
  userAvatar:    { width: '32px', height: '32px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  userName:      { margin: 0, color: '#e8f4ff', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRol:       { margin: 0, color: 'rgba(160,200,255,0.5)', fontSize: '0.72rem', textTransform: 'capitalize' },

  navItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px', border: 'none',
    background: 'transparent', color: 'rgba(160,200,255,0.6)',
    cursor: 'pointer', fontSize: '0.88rem', width: '100%', textAlign: 'left',
    transition: 'background 0.15s',
  },
  navItemActivo: { background: 'rgba(100,180,255,0.12)', color: '#64b4ff' },
  navIcono:      { fontSize: '1.1rem', flexShrink: 0, width: '20px', textAlign: 'center' },
  navLabel:      { display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' },
  navCount:      { background: 'rgba(100,180,255,0.15)', color: '#64b4ff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: 600 },

  main:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '58px', background: 'rgba(5,18,40,0.8)', borderBottom: '1px solid rgba(100,180,255,0.08)', flexShrink: 0 },
  topbarTitulo: { margin: 0, color: '#e8f4ff', fontWeight: 700, fontSize: '1rem' },
  contenido: { flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' },

  mensaje:     { padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem' },
  lista:       { display: 'flex', flexDirection: 'column', gap: '10px' },
  vacio:       { textAlign: 'center', color: 'rgba(160,200,255,0.35)', padding: '2rem 0', margin: 0 },
  item:        { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', background: 'rgba(5,18,40,0.6)', border: '1px solid rgba(100,180,255,0.1)', borderRadius: '12px', padding: '14px 16px' },
  itemLeft:    { display: 'flex', gap: '12px', flex: 1, minWidth: 0 },
  itemIcono:   { fontSize: '1.4rem', flexShrink: 0 },
  itemInfo:    { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  itemTitulo:  { margin: 0, color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  itemSub:     { margin: 0, color: 'rgba(160,200,255,0.55)', fontSize: '0.8rem' },
  itemDesc:    { margin: 0, color: 'rgba(160,200,255,0.45)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  botonEliminar: { padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0 },
  botonCrear:  { padding: '12px', borderRadius: '10px', border: '1px dashed rgba(100,180,255,0.3)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'center' },
  formZona:    { background: 'rgba(5,18,40,0.7)', border: '1px solid rgba(100,180,255,0.15)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '14px' },
  formTitulo:  { margin: 0, color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  input:       { padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', background: 'rgba(10,25,60,0.8)', color: '#e8f4ff', fontSize: '0.9rem', outline: 'none' },
  nivelWrap:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  nivelLabel:  { color: 'rgba(160,200,255,0.7)', fontSize: '0.85rem' },
  nivelDesc:   { display: 'flex', justifyContent: 'space-between', color: 'rgba(160,200,255,0.4)', fontSize: '0.75rem' },
  botonesRow:  { display: 'flex', gap: '10px' },
  botonCancelar: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', background: 'transparent', color: '#64b4ff', cursor: 'pointer', fontSize: '0.88rem' },
  botonGuardar:  { flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#1565c0,#0d47a1)', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' },
  botonMini:   { padding: '4px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem' },
  centro:      { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner:     { width: '32px', height: '32px', border: '3px solid rgba(100,180,255,0.2)', borderTop: '3px solid #64b4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}

export default GestorPage