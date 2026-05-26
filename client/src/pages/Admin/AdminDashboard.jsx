import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { obtenerStats, obtenerUsuarios, cambiarRol } from '../../services/admin.service'

function AdminDashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]         = useState('stats')
  const [stats, setStats]     = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje]   = useState(null)
  const [cambiandoRol, setCambiandoRol] = useState(null)
  const [sidebarAbierto, setSidebarAbierto] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [sRes, uRes] = await Promise.all([obtenerStats(), obtenerUsuarios()])
      setStats(sRes.data)
      setUsuarios(uRes.data)
    } catch { mostrarMensaje('error', 'Error al cargar datos') }
    finally { setCargando(false) }
  }

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleCambiarRol = async (id, rolActual) => {
    const orden = ['turista', 'gestor', 'admin']
    const siguiente = orden[(orden.indexOf(rolActual) + 1) % orden.length]
    if (!window.confirm(`Cambiar rol a "${siguiente}"?`)) return
    setCambiandoRol(id)
    try {
      const { data } = await cambiarRol(id, siguiente)
      setUsuarios(prev => prev.map(u => u._id === id ? { ...u, rol: data.rol } : u))
      mostrarMensaje('ok', `Rol actualizado a ${siguiente}`)
    } catch { mostrarMensaje('error', 'No se pudo cambiar el rol') }
    finally { setCambiandoRol(null) }
  }

  const rolColor  = { admin: '#f59e0b', gestor: '#3b82f6', turista: '#10b981' }
  const rolSig    = { turista: 'gestor', gestor: 'admin', admin: 'turista' }

  const navItems = [
    { id: 'stats',    label: 'Estadísticas', icono: '📊' },
    { id: 'usuarios', label: 'Usuarios',     icono: '👥', count: usuarios.length },
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
                    {item.count != null && <span style={s.navCount}>{item.count}</span>}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div style={s.sidebarFooter}>
            <button style={s.navItem} onClick={() => navigate('/mapa')} title="Mapa">
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
              <div style={{ ...s.userAvatar, background: rolColor[usuario?.rol] || '#1565c0' }}>
                {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={s.userName}>{usuario?.nombre}</p>
                <p style={s.userRol}>{usuario?.rol}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main style={s.main}>
          <div style={s.topbar}>
            <h1 style={s.topbarTitulo}>
              {tab === 'stats' ? 'Estadísticas' : 'Usuarios'}
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

            {/* Stats */}
            {tab === 'stats' && stats && (
              <div style={s.statsWrap}>
                <div style={s.cardsRow}>
                  {[
                    { label: 'Usuarios', valor: stats.usuarios, color: '#3b82f6', icono: '👥' },
                    { label: 'Reportes', valor: stats.reportes, color: '#f59e0b', icono: '📋' },
                    { label: 'Zonas',    valor: stats.zonas,    color: '#10b981', icono: '🗺️' },
                    { label: 'Posts',    valor: stats.posts,    color: '#8b5cf6', icono: '💬' },
                  ].map(c => (
                    <div key={c.label} style={{ ...s.statCard, borderColor: `${c.color}33` }}>
                      <span style={s.statIcono}>{c.icono}</span>
                      <p style={{ ...s.statValor, color: c.color }}>{c.valor}</p>
                      <p style={s.statLabel}>{c.label}</p>
                    </div>
                  ))}
                </div>

                {stats.reportesPorTipo?.length > 0 && (
                  <div style={s.seccion}>
                    <p style={s.seccionTitulo}>Reportes por tipo</p>
                    <div style={s.barras}>
                      {stats.reportesPorTipo.map(r => {
                        const max = Math.max(...stats.reportesPorTipo.map(x => x.total))
                        const pct = max > 0 ? (r.total / max) * 100 : 0
                        return (
                          <div key={r._id} style={s.barraRow}>
                            <span style={s.barraTipo}>{r._id}</span>
                            <div style={s.barraTrack}>
                              <div style={{ ...s.barraFill, width: `${pct}%` }} />
                            </div>
                            <span style={s.barraVal}>{r.total}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Usuarios */}
            {tab === 'usuarios' && (
              <div style={s.lista}>
                {usuarios.length === 0 && <p style={s.vacio}>No hay usuarios</p>}
                {usuarios.map(u => (
                  <div key={u._id} style={s.item}>
                    <div style={s.itemLeft}>
                      <div style={{ ...s.avatarMin, background: rolColor[u.rol] || '#6366f1' }}>
                        {u.nombre?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={s.itemInfo}>
                        <div style={s.itemTituloRow}>
                          <p style={s.itemTitulo}>{u.nombre}</p>
                          <span style={{
                            ...s.rolBadge,
                            background: `${rolColor[u.rol] || '#6366f1'}22`,
                            color: rolColor[u.rol] || '#6366f1',
                            border: `1px solid ${rolColor[u.rol] || '#6366f1'}44`,
                          }}>
                            {u.rol}
                          </span>
                        </div>
                        <p style={s.itemSub}>{u.email}</p>
                        <p style={s.itemSub}>Registrado: {new Date(u.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                    </div>
                    {u._id !== usuario?._id ? (
                      <button
                        style={{ ...s.botonRol, opacity: cambiandoRol === u._id ? 0.6 : 1 }}
                        onClick={() => handleCambiarRol(u._id, u.rol)}
                        disabled={cambiandoRol === u._id}
                      >
                        {cambiandoRol === u._id ? '...' : `→ ${rolSig[u.rol]}`}
                      </button>
                    ) : (
                      <span style={s.tuLabel}>Tú</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const s = {
  root:    { height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' },
  bg:      { position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#020b18 0%,#051832 40%,#071e3d 100%)', zIndex: 0 },
  layout:  { position: 'relative', zIndex: 10, display: 'flex', flex: 1, overflow: 'hidden' },

  sidebar: { display: 'flex', flexDirection: 'column', background: 'rgba(5,18,40,0.97)', borderRight: '1px solid rgba(100,180,255,0.1)', transition: 'width 0.25s ease', overflow: 'hidden', flexShrink: 0 },
  sidebarHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 14px', borderBottom: '1px solid rgba(100,180,255,0.08)', minHeight: '58px' },
  sidebarMarca: { color: '#fff', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' },
  toggleBtn: { background: 'rgba(100,180,255,0.1)', border: 'none', color: '#64b4ff', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 },
  sidebarNav:    { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  sidebarFooter: { padding: '8px', borderTop: '1px solid rgba(100,180,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' },
  sidebarUser:   { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderTop: '1px solid rgba(100,180,255,0.08)' },
  userAvatar:    { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  userName:      { margin: 0, color: '#e8f4ff', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRol:       { margin: 0, color: 'rgba(160,200,255,0.5)', fontSize: '0.72rem', textTransform: 'capitalize' },
  navItem:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(160,200,255,0.6)', cursor: 'pointer', fontSize: '0.88rem', width: '100%', textAlign: 'left' },
  navItemActivo: { background: 'rgba(100,180,255,0.12)', color: '#64b4ff' },
  navIcono:      { fontSize: '1.1rem', flexShrink: 0, width: '20px', textAlign: 'center' },
  navLabel:      { display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' },
  navCount:      { background: 'rgba(100,180,255,0.15)', color: '#64b4ff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: 600 },

  main:     { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '58px', background: 'rgba(5,18,40,0.8)', borderBottom: '1px solid rgba(100,180,255,0.08)', flexShrink: 0 },
  topbarTitulo: { margin: 0, color: '#e8f4ff', fontWeight: 700, fontSize: '1rem' },
  contenido: { flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },

  mensaje:  { padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem' },
  statsWrap: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  cardsRow:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' },
  statCard:  { background: 'rgba(5,18,40,0.7)', border: '1px solid', borderRadius: '14px', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  statIcono: { fontSize: '1.6rem' },
  statValor: { margin: 0, fontSize: '2rem', fontWeight: '700' },
  statLabel: { margin: 0, color: 'rgba(160,200,255,0.55)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  seccion:   { background: 'rgba(5,18,40,0.7)', border: '1px solid rgba(100,180,255,0.1)', borderRadius: '14px', padding: '1.25rem' },
  seccionTitulo: { margin: '0 0 1rem', color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  barras:    { display: 'flex', flexDirection: 'column', gap: '10px' },
  barraRow:  { display: 'flex', alignItems: 'center', gap: '10px' },
  barraTipo: { color: 'rgba(160,200,255,0.7)', fontSize: '0.82rem', width: '80px', flexShrink: 0, textTransform: 'capitalize' },
  barraTrack: { flex: 1, height: '8px', background: 'rgba(100,180,255,0.1)', borderRadius: '4px', overflow: 'hidden' },
  barraFill:  { height: '100%', background: 'linear-gradient(90deg,#1565c0,#3b82f6)', borderRadius: '4px', transition: 'width 0.4s ease' },
  barraVal:   { color: '#64b4ff', fontSize: '0.82rem', fontWeight: '600', width: '24px', textAlign: 'right', flexShrink: 0 },
  lista:     { display: 'flex', flexDirection: 'column', gap: '10px' },
  vacio:     { textAlign: 'center', color: 'rgba(160,200,255,0.35)', padding: '2rem 0', margin: 0 },
  item:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: 'rgba(5,18,40,0.7)', border: '1px solid rgba(100,180,255,0.1)', borderRadius: '12px', padding: '14px 16px' },
  itemLeft:  { display: 'flex', gap: '12px', flex: 1, minWidth: 0 },
  avatarMin: { width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem', flexShrink: 0 },
  itemInfo:  { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  itemTituloRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  itemTitulo: { margin: 0, color: '#e8f4ff', fontWeight: '600', fontSize: '0.95rem' },
  itemSub:   { margin: 0, color: 'rgba(160,200,255,0.5)', fontSize: '0.8rem' },
  rolBadge:  { padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 },
  botonRol:  { padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(100,180,255,0.25)', background: 'rgba(100,180,255,0.08)', color: '#64b4ff', cursor: 'pointer', fontSize: '0.82rem', flexShrink: 0, whiteSpace: 'nowrap' },
  tuLabel:   { color: 'rgba(160,200,255,0.35)', fontSize: '0.82rem', flexShrink: 0 },
  centro:    { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner:   { width: '32px', height: '32px', border: '3px solid rgba(100,180,255,0.2)', borderTop: '3px solid #64b4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
}

export default AdminDashboard