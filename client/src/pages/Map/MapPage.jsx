import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { obtenerReportes } from '../../services/reports.service'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const iconosPorTipo = {
  accidente: { emoji:'⚠️', color:'#f59e0b' },
  robo:      { emoji:'🚨', color:'#ef4444' },
  obra:      { emoji:'🚧', color:'#f97316' },
  peligro:   { emoji:'⛔', color:'#dc2626' },
  turismo:   { emoji:'📍', color:'#3b82f6' },
  default:   { emoji:'📌', color:'#6366f1' },
}

const crearIcono = (tipo) => {
  const info = iconosPorTipo[tipo?.toLowerCase()] || iconosPorTipo.default
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${info.color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.4)"><span style="transform:rotate(45deg);font-size:16px">${info.emoji}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  })
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
const BOGOTA = [4.711, -74.0721]

function BotonUbicacion() {
  const map = useMap()
  const [activo, setActivo] = useState(false)
  const centrar = () => {
    setActivo(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => { map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.2 }); setTimeout(() => setActivo(false), 1500) },
      () => setActivo(false)
    )
  }
  return (
    <div onClick={centrar} title="Mi ubicación" style={{ position:'absolute', bottom:'120px', right:'16px', zIndex:1000, width:'44px', height:'44px', borderRadius:'12px', background: activo ? '#1565c0' : 'rgba(5,18,40,0.9)', border:'1px solid rgba(100,180,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', backdropFilter:'blur(10px)', transition:'background 0.2s', boxShadow:'0 2px 12px rgba(0,0,0,0.4)', fontSize:'20px' }}>
      🎯
    </div>
  )
}

function MapPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [reportes, setReportes] = useState([])
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    obtenerReportes().then(({ data }) => setReportes(data)).catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const tipos = ['todos', ...new Set(reportes.map((r) => r.tipo).filter(Boolean))]
  const reportesFiltrados = filtro === 'todos' ? reportes : reportes.filter((r) => r.tipo === filtro)
  const initials = usuario?.nombre?.split(' ').slice(0,2).map((n) => n[0]).join('').toUpperCase() || 'U'

  return (
    <div style={s.root}>
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.navLogo}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#64b4ff" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="4" fill="#64b4ff"/>
              <line x1="14" y1="1" x2="14" y2="7" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="21" x2="14" y2="27" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="14" x2="7" y2="14" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="21" y1="14" x2="27" y2="14" stroke="#64b4ff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={s.navMarca}>Safe Tour</span>
          </div>
          <div style={s.filtros}>
            {tipos.slice(0,5).map((t) => (
              <button key={t} onClick={() => setFiltro(t)} style={{ ...s.filtroBtn, background: filtro===t ? 'rgba(100,180,255,0.25)' : 'transparent', borderColor: filtro===t ? 'rgba(100,180,255,0.6)' : 'rgba(100,180,255,0.15)', color: filtro===t ? '#a0c8ff' : 'rgba(160,200,255,0.5)' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={s.navRight}>
          <div style={s.badge}>
            <span style={{ fontSize:'10px', color:'rgba(160,200,255,0.6)' }}>Reportes</span>
            <span style={{ fontSize:'16px', fontWeight:'700', color:'#64b4ff' }}>{reportesFiltrados.length}</span>
          </div>
          <div style={s.avatar} title={usuario?.nombre}>{initials}</div>
          <button style={s.botonSalir} onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      <div style={s.mapaWrap}>
        <MapContainer center={BOGOTA} zoom={13} style={s.mapa} zoomControl={false}>
          <TileLayer attribution={TILE_ATTR} url={TILE_URL}/>
          {reportesFiltrados.map((r) =>
            r.ubicacion?.lat && r.ubicacion?.lng ? (
              <Marker key={r._id} position={[r.ubicacion.lat, r.ubicacion.lng]} icon={crearIcono(r.tipo)}>
                <Popup>
                  <div style={s.popupInner}>
                    <div style={s.popupTipo}>{iconosPorTipo[r.tipo?.toLowerCase()]?.emoji || '📌'} {r.tipo}</div>
                    <strong style={s.popupTitulo}>{r.titulo}</strong>
                    {r.descripcion && <p style={s.popupDesc}>{r.descripcion}</p>}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
          <BotonUbicacion/>
        </MapContainer>

        <div style={{ ...s.panel, transform: panelAbierto ? 'translateX(0)' : 'translateX(calc(100% + 16px))' }}>
          <div style={s.panelHeader}>
            <span style={s.panelTitulo}>Reportes activos</span>
            <button style={s.panelClose} onClick={() => setPanelAbierto(false)}>✕</button>
          </div>
          <div style={s.panelLista}>
            {reportesFiltrados.length === 0
              ? <p style={s.panelVacio}>Sin reportes en esta zona</p>
              : reportesFiltrados.map((r) => {
                  const info = iconosPorTipo[r.tipo?.toLowerCase()] || iconosPorTipo.default
                  return (
                    <div key={r._id} style={s.panelItem}>
                      <div style={{ ...s.panelDot, background: info.color }}>{info.emoji}</div>
                      <div style={s.panelItemInfo}>
                        <span style={s.panelItemTitulo}>{r.titulo || 'Sin título'}</span>
                        <span style={s.panelItemTipo}>{r.tipo}</span>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        <button style={s.panelToggle} onClick={() => setPanelAbierto(!panelAbierto)}>
          {panelAbierto ? '✕' : '📋'}
        </button>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper { background:rgba(5,18,40,0.95)!important; border:1px solid rgba(100,180,255,0.3)!important; border-radius:12px!important; color:#e8f4ff!important; backdrop-filter:blur(10px)!important; }
        .leaflet-popup-tip { background:rgba(5,18,40,0.95)!important; }
        .leaflet-popup-close-button { color:rgba(160,200,255,0.6)!important; }
        .leaflet-control-zoom { border:1px solid rgba(100,180,255,0.25)!important; border-radius:10px!important; overflow:hidden; }
        .leaflet-control-zoom a { background:rgba(5,18,40,0.9)!important; color:#a0c8ff!important; border-bottom:1px solid rgba(100,180,255,0.15)!important; }
        .leaflet-control-zoom a:hover { background:rgba(20,50,100,0.95)!important; }
        .leaflet-bar { box-shadow:0 2px 12px rgba(0,0,0,0.4)!important; }
      `}</style>
    </div>
  )
}

const s = {
  root: { display:'flex', flexDirection:'column', height:'100vh', background:'#020b18', fontFamily:"'Segoe UI', system-ui, sans-serif" },
  navbar: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 1.25rem', height:'58px', background:'rgba(5,18,40,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(100,180,255,0.12)', zIndex:1100, flexShrink:0, gap:'1rem' },
  navLeft: { display:'flex', alignItems:'center', gap:'1.25rem', flex:1, minWidth:0 },
  navLogo: { display:'flex', alignItems:'center', gap:'8px', flexShrink:0 },
  navMarca: { fontWeight:'700', fontSize:'1rem', color:'#e8f4ff', letterSpacing:'-0.3px' },
  filtros: { display:'flex', gap:'6px', overflowX:'auto', scrollbarWidth:'none' },
  filtroBtn: { padding:'4px 12px', borderRadius:'20px', border:'1px solid', fontSize:'0.78rem', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s', fontWeight:'500' },
  navRight: { display:'flex', alignItems:'center', gap:'12px', flexShrink:0 },
  badge: { display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1.1 },
  avatar: { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#1565c0,#0d47a1)', border:'2px solid rgba(100,180,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8f4ff', fontSize:'0.78rem', fontWeight:'700', cursor:'pointer', flexShrink:0 },
  botonSalir: { padding:'6px 14px', background:'rgba(100,180,255,0.08)', border:'1px solid rgba(100,180,255,0.2)', borderRadius:'8px', color:'rgba(160,200,255,0.7)', fontSize:'0.82rem', cursor:'pointer', fontWeight:'500' },
  mapaWrap: { flex:1, position:'relative', overflow:'hidden' },
  mapa: { width:'100%', height:'100%' },
  popupInner: { minWidth:'160px', padding:'2px 0' },
  popupTipo: { fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px', color:'rgba(160,200,255,0.6)', marginBottom:'4px' },
  popupTitulo: { display:'block', fontSize:'14px', color:'#e8f4ff', marginBottom:'4px' },
  popupDesc: { fontSize:'12px', color:'rgba(160,200,255,0.7)', margin:0, lineHeight:1.4 },
  panel: { position:'absolute', top:'16px', right:'16px', width:'260px', maxHeight:'calc(100% - 32px)', background:'rgba(5,18,40,0.92)', backdropFilter:'blur(16px)', border:'1px solid rgba(100,180,255,0.2)', borderRadius:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:1000, transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)', display:'flex', flexDirection:'column', overflow:'hidden' },
  panelHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid rgba(100,180,255,0.12)' },
  panelTitulo: { fontSize:'0.85rem', fontWeight:'600', color:'#a0c8ff', letterSpacing:'0.3px' },
  panelClose: { background:'none', border:'none', color:'rgba(160,200,255,0.5)', cursor:'pointer', fontSize:'14px', padding:'2px 6px', borderRadius:'6px' },
  panelLista: { overflowY:'auto', flex:1, padding:'8px 0' },
  panelVacio: { textAlign:'center', color:'rgba(160,200,255,0.4)', fontSize:'0.83rem', padding:'2rem 1rem', margin:0 },
  panelItem: { display:'flex', alignItems:'center', gap:'10px', padding:'10px 16px', borderBottom:'1px solid rgba(100,180,255,0.06)', cursor:'pointer' },
  panelDot: { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0, opacity:0.85 },
  panelItemInfo: { display:'flex', flexDirection:'column', gap:'2px', minWidth:0 },
  panelItemTitulo: { fontSize:'0.83rem', color:'#d0e8ff', fontWeight:'500', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  panelItemTipo: { fontSize:'0.74rem', color:'rgba(160,200,255,0.5)', textTransform:'capitalize' },
  panelToggle: { position:'absolute', bottom:'80px', right:'16px', width:'44px', height:'44px', borderRadius:'12px', background:'rgba(5,18,40,0.9)', border:'1px solid rgba(100,180,255,0.3)', color:'#fff', fontSize:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1001, backdropFilter:'blur(10px)', boxShadow:'0 2px 12px rgba(0,0,0,0.4)' },
}

export default MapPage