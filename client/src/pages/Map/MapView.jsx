import { MapContainer, TileLayer, Marker, Popup, Polygon, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
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

export const coloresPorTipoZona = {
  turistica: { color: '#3b82f6' },
  cultural:  { color: '#8b5cf6' },
  peligrosa: { color: '#ef4444' },
  segura:    { color: '#10b981' },
}

const TILES = {
  noche: {
    url:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO',
  },
  dia: {
    url:  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: '&copy; OpenStreetMap &copy; CARTO',
  },
}

const crearIcono = (tipo) => {
  const info = iconosPorTipo[tipo?.toLowerCase()] || iconosPorTipo.default
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${info.color};border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.3)"><span style="transform:rotate(45deg);font-size:16px">${info.emoji}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36],
  })
}

const iconoYo = L.divIcon({
  className: '',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#0ea5e9;border:3px solid white;box-shadow:0 0 16px #0ea5e9;"></div>',
  iconSize: [20, 20], iconAnchor: [10, 10],
})

const BOGOTA = [4.711, -74.0721]

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
  return <div onClick={centrar} title="Mi ubicación" style={s.botonGps}>🎯</div>
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

export default function MapView({
  reportes, zonas = [],
  miUbicacion, setMiUbicacion,
  posicionNueva, setPosicionNueva,
  setMostrarFormulario, creandoReporte, tipoNuevo,
  modoNoche, setModoNoche,
}) {
  const tile = TILES[modoNoche ? 'noche' : 'dia']

  return (
    <MapContainer center={BOGOTA} zoom={13} style={s.mapa} zoomControl={false}>
      <ZoomControl position="bottomleft" />
      <TileLayer attribution={tile.attr} url={tile.url} />
      <SelectorUbicacion
        creandoReporte={creandoReporte}
        setPosicionNueva={setPosicionNueva}
        setMostrarFormulario={setMostrarFormulario}
      />

      {zonas.filter(z => z.coordenadas?.length >= 3).map(z => {
        const col = (coloresPorTipoZona[z.tipo] || coloresPorTipoZona.turistica).color
        return (
          <Polygon
            key={z._id}
            positions={z.coordenadas.map(c => [c.lat, c.lng])}
            pathOptions={{ color: col, fillColor: col, fillOpacity: 0.18, weight: 2 }}
          >
            <Popup>
              <strong>{z.nombre}</strong><br />
              <span style={{ fontSize: '12px', color: '#555' }}>
                {z.tipo} · Seguridad: {z.nivelSeguridad}/5
              </span>
              {z.descripcion && <p style={{ margin: '4px 0 0', fontSize: '12px' }}>{z.descripcion}</p>}
            </Popup>
          </Polygon>
        )
      })}

      {reportes.map(r =>
        r.ubicacion?.lat && r.ubicacion?.lng ? (
          <Marker key={r._id} position={[r.ubicacion.lat, r.ubicacion.lng]} icon={crearIcono(r.tipo)}>
            <Popup>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
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

      {/* Botón día/noche */}
      <div
        onClick={() => setModoNoche(prev => !prev)}
        title={modoNoche ? 'Modo día' : 'Modo noche'}
        style={s.botonModo}
      >
        {modoNoche ? '☀️' : '🌙'}
      </div>
    </MapContainer>
  )
}

const s = {
  mapa: { width: '100%', height: '100%' },
  botonGps: {
    position: 'absolute', bottom: '120px', right: '16px', zIndex: 1000,
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'rgba(5,18,40,0.85)', border: '1px solid rgba(100,180,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)', fontSize: '20px',
  },
  botonModo: {
    position: 'absolute', bottom: '170px', right: '16px', zIndex: 1000,
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'rgba(5,18,40,0.85)', border: '1px solid rgba(100,180,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.25)', fontSize: '20px',
  },
}