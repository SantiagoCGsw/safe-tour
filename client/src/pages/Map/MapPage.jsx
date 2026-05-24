import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { obtenerReportes, crearReporte } from '../../services/reports.service'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const iconosPorTipo = {
  accidente: { emoji: '⚠️', color: '#f59e0b' },
  robo:      { emoji: '🚨', color: '#ef4444' },
  obra:      { emoji: '🚧', color: '#f97316' },
  peligro:   { emoji: '⛔', color: '#dc2626' },
  turismo:   { emoji: '📍', color: '#3b82f6' },
  default:   { emoji: '📌', color: '#6366f1' },
}

const crearIcono = (tipo) => {
  const info = iconosPorTipo[tipo?.toLowerCase()] || iconosPorTipo.default
  return L.divIcon({
    className: '',
    html:
      '<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:' +
      info.color +
      ';border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.4)">' +
      '<span style="transform:rotate(45deg);font-size:16px">' +
      info.emoji +
      '</span></div>',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO'
const BOGOTA = [4.711, -74.0721]

function BotonUbicacion({ setMiUbicacion }) {
  const map = useMap()

  const centrar = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude]
      setMiUbicacion(coords)
      map.flyTo(coords, 16, { duration: 1.2 })
    })
  }

  return (
    <div
      onClick={centrar}
      title="Mi ubicación"
      style={{
        position: 'absolute',
        bottom: '120px',
        right: '16px',
        zIndex: 1000,
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(5,18,40,0.9)',
        border: '1px solid rgba(100,180,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        fontSize: '20px',
      }}
    >
      🎯
    </div>
  )
}

function SelectorUbicacion({ creandoReporte, setPosicionNueva, setMostrarFormulario }) {
  useMapEvents({
    click(e) {
      if (!creandoReporte) return
      setPosicionNueva({ lat: e.latlng.lat, lng: e.latlng.lng })
      setMostrarFormulario(true)
    },
  })
  return null
}

function MapPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [reportes, setReportes] = useState([])
  const [reportesLocales, setReportesLocales] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [creandoReporte, setCreandoReporte] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [posicionNueva, setPosicionNueva] = useState(null)
  const [miUbicacion, setMiUbicacion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [nuevoReporte, setNuevoReporte] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'accidente',
  })

  useEffect(() => {
    obtenerReportes()
      .then(({ data }) => setReportes(data))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const crearReporteEnAPI = async () => {
    if (!posicionNueva) return
    setEnviando(true)

    try {
      const payload = {
        titulo: nuevoReporte.titulo || 'Nuevo reporte',
        descripcion: nuevoReporte.descripcion || '',
        tipo: nuevoReporte.tipo,
        ubicacion: {
          lat: posicionNueva.lat,
          lng: posicionNueva.lng,
          direccion: ''
        }
      }

      const { data } = await crearReporte(payload)
      setReportes(prev => [...prev, data])

    } catch {
      const local = {
        _id: Date.now(),
        titulo: nuevoReporte.titulo || 'Nuevo reporte',
        descripcion: nuevoReporte.descripcion || '',
        tipo: nuevoReporte.tipo,
        ubicacion: { lat: posicionNueva.lat, lng: posicionNueva.lng }
      }
      setReportesLocales(prev => [...prev, local])
    } finally {
      setEnviando(false)
      setMostrarFormulario(false)
      setCreandoReporte(false)
      setPosicionNueva(null)
      setNuevoReporte({ titulo: '', descripcion: '', tipo: 'accidente' })
    }
  }

  const eliminarReporteLocal = (id) => {
    setReportesLocales(prev => prev.filter(r => r._id !== id))
  }

  const todosReportes = [...reportes, ...reportesLocales]

  const tipos = [
    'todos',
    ...new Set(todosReportes.map(r => r.tipo).filter(Boolean))
  ]

  const reportesFiltrados =
    filtro === 'todos'
      ? todosReportes
      : todosReportes.filter(r => r.tipo === filtro)

  const initials =
    usuario?.nombre
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <div style={s.root}>
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.navMarca}>Safe Tour</span>

          <div style={s.contador}>{reportesFiltrados.length}</div>

          <div style={s.filtros}>
            {tipos.slice(0, 5).map(t => (
              <button
                key={t}
                onClick={() => setFiltro(t)}
                style={{
                  ...s.filtroBtn,
                  background: filtro === t ? 'rgba(100,180,255,0.25)' : 'transparent',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={s.navRight}>
          <div
            style={{ ...s.avatar, cursor: 'pointer' }}
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
          >
            {initials}
          </div>

          {(usuario?.rol === 'gestor' || usuario?.rol === 'admin') && (
            <button style={s.botonNav} onClick={() => navigate('/gestor')}>
              Gestor
            </button>
          )}

          {usuario?.rol === 'admin' && (
            <button style={s.botonNav} onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}

          <button style={s.botonSalir} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </nav>

      <div style={s.mapaWrap}>
        <MapContainer center={BOGOTA} zoom={13} style={s.mapa} zoomControl={false}>
          <ZoomControl position="bottomleft" />

          <TileLayer attribution={TILE_ATTR} url={TILE_URL} />

          <SelectorUbicacion
            creandoReporte={creandoReporte}
            setPosicionNueva={setPosicionNueva}
            setMostrarFormulario={setMostrarFormulario}
          />

          {reportesFiltrados.map(r =>
            r.ubicacion?.lat && r.ubicacion?.lng ? (
              <Marker
                key={r._id}
                position={[r.ubicacion.lat, r.ubicacion.lng]}
                icon={crearIcono(r.tipo)}
              >
                <Popup>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
                    <strong>{r.titulo}</strong>
                    <div>{r.descripcion}</div>
                    {reportesLocales.some(local => local._id === r._id) && (
                      <button
                        onClick={() => eliminarReporteLocal(r._id)}
                        style={{
                          border: 'none',
                          padding: '8px',
                          borderRadius: '8px',
                          background: '#ef4444',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        Borrar reporte
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}

          {miUbicacion && (
            <Marker
              position={miUbicacion}
              eventHandlers={{
                mouseover: e => e.target.openPopup(),
                mouseout: e => e.target.closePopup(),
              }}
              icon={L.divIcon({
                className: '',
                html: '<div style="width:20px;height:20px;border-radius:50%;background:#00e5ff;border:3px solid white;box-shadow:0 0 20px #00e5ff;"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup closeButton={false}>Tú</Popup>
            </Marker>
          )}

          {posicionNueva && (
            <Marker
              position={[posicionNueva.lat, posicionNueva.lng]}
              icon={crearIcono(nuevoReporte.tipo)}
            />
          )}

          <BotonUbicacion setMiUbicacion={setMiUbicacion} />
        </MapContainer>

        {mostrarFormulario && posicionNueva && (
          <div style={s.formulario}>
            <div style={s.formHeader}>
              <span>Crear reporte</span>
              <button
                onClick={() => {
                  setMostrarFormulario(false)
                  setCreandoReporte(false)
                  setPosicionNueva(null)
                }}
                style={s.closeBtn}
              >
                ✕
              </button>
            </div>

            <input
              placeholder="Título"
              value={nuevoReporte.titulo}
              onChange={e => setNuevoReporte({ ...nuevoReporte, titulo: e.target.value })}
              style={s.input}
            />

            <textarea
              placeholder="Descripción"
              rows={3}
              value={nuevoReporte.descripcion}
              onChange={e => setNuevoReporte({ ...nuevoReporte, descripcion: e.target.value })}
              style={s.input}
            />

            <select
              value={nuevoReporte.tipo}
              onChange={e => setNuevoReporte({ ...nuevoReporte, tipo: e.target.value })}
              style={s.input}
            >
              <option value="accidente">Accidente</option>
              <option value="robo">Robo</option>
              <option value="obra">Obra</option>
              <option value="peligro">Peligro</option>
              <option value="turismo">Turismo</option>
            </select>

            <button
              style={{ ...s.crearBtn, opacity: enviando ? 0.7 : 1 }}
              onClick={crearReporteEnAPI}
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Crear reporte'}
            </button>
          </div>
        )}

        <button
          style={{
            ...s.panelToggle,
            background: creandoReporte ? '#1565c0' : 'rgba(5,18,40,0.9)',
          }}
          onClick={() => {
            setCreandoReporte(!creandoReporte)
            setMostrarFormulario(false)
            setPosicionNueva(null)
          }}
        >
          📋
        </button>
      </div>
    </div>
  )
}

const s = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#020b18' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', height: '58px', background: 'rgba(5,18,40,0.95)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  navMarca: { color: '#fff', fontWeight: '700' },
  contador: { minWidth: '34px', height: '34px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' },
  filtros: { display: 'flex', gap: '6px' },
  filtroBtn: { padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  botonNav: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(100,180,255,0.15)', color: '#64b4ff', cursor: 'pointer', fontSize: '13px' },
  botonSalir: { padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer' },
  mapaWrap: { flex: 1, position: 'relative' },
  mapa: { width: '100%', height: '100%' },
  panelToggle: { position: 'absolute', bottom: '65px', right: '16px', width: '44px', height: '44px', borderRadius: '12px', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px', zIndex: 1200 },
  formulario: { position: 'absolute', left: '16px', bottom: '16px', width: '320px', background: 'rgba(5,18,40,0.95)', borderRadius: '16px', padding: '16px', zIndex: 1200, display: 'flex', flexDirection: 'column', gap: '12px' },
  formHeader: { display: 'flex', justifyContent: 'space-between', color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer' },
  input: { padding: '10px', borderRadius: '10px', border: '1px solid rgba(100,180,255,0.2)', outline: 'none', background: 'rgba(10,25,50,0.95)', color: '#e8f4ff' },
  crearBtn: { padding: '12px', borderRadius: '10px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer' },
}

const style = document.createElement('style')
style.innerHTML = `
  input::placeholder, textarea::placeholder { color: rgba(200,220,255,0.45); }
  select { color: #e8f4ff; }
`
document.head.appendChild(style)

export default MapPage