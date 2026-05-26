import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${info.color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.4)"><span style="transform:rotate(45deg);font-size:16px">${info.emoji}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  })
}

const iconoYo = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#00e5ff;border:3px solid white;box-shadow:0 0 20px #00e5ff;"></div>',
  iconSize: [20, 20], iconAnchor: [10, 10],
})

const TILE_URL  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO'
const BOGOTA    = [4.711, -74.0721]

function BotonUbicacion({ setMiUbicacion }) {
  const map = useMap()
  const centrar = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.latitude, pos.coords.longitude]
      setMiUbicacion(coords)
      map.flyTo(coords, 16, { duration: 1.2 })
    })
  }
  return (
    <div onClick={centrar} title="Mi ubicación" style={s.botonGps}>🎯</div>
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

export default function MapView({ reportes, miUbicacion, setMiUbicacion, posicionNueva, setPosicionNueva, setMostrarFormulario, creandoReporte, tipoNuevo }) {
  return (
    <MapContainer center={BOGOTA} zoom={13} style={s.mapa} zoomControl={false}>
      <ZoomControl position="bottomleft" />
      <TileLayer attribution={TILE_ATTR} url={TILE_URL} />
      <SelectorUbicacion creandoReporte={creandoReporte} setPosicionNueva={setPosicionNueva} setMostrarFormulario={setMostrarFormulario} />

      {reportes.map(r =>
        r.ubicacion?.lat && r.ubicacion?.lng ? (
          <Marker key={r._id} position={[r.ubicacion.lat, r.ubicacion.lng]} icon={crearIcono(r.tipo)}>
            <Popup>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                <strong style={{ color: '#1a1a2e' }}>{r.titulo}</strong>
                <span style={{ fontSize: '12px', color: '#555' }}>{r.tipo} · {r.autor?.nombre || 'Anónimo'}</span>
                {r.descripcion && <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{r.descripcion}</p>}
              </div>
            </Popup>
          </Marker>
        ) : null
      )}

      {miUbicacion && (
        <Marker position={miUbicacion} icon={iconoYo}>
          <Popup closeButton={false}>Tú</Popup>
        </Marker>
      )}

      {posicionNueva && (
        <Marker position={[posicionNueva.lat, posicionNueva.lng]} icon={crearIcono(tipoNuevo)} />
      )}

      <BotonUbicacion setMiUbicacion={setMiUbicacion} />
    </MapContainer>
  )
}

const s = {
  mapa:     { width: '100%', height: '100%' },
  botonGps: { position: 'absolute', bottom: '120px', right: '16px', zIndex: 1000, width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(5,18,40,0.9)', border: '1px solid rgba(100,180,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', fontSize: '20px' },
}