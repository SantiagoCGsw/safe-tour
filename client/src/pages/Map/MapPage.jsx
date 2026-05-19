import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { obtenerReportes } from '../../services/reports.service'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icono por defecto de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Centro de Bogotá
const BOGOTA = [4.711, -74.0721]

function MapPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [reportes, setReportes] = useState([])

  useEffect(() => {
    obtenerReportes()
      .then(({ data }) => setReportes(data))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.navbar}>
        <span style={estilos.marca}>🗺️ Safe Tour</span>
        <div style={estilos.navDerecha}>
          <span style={estilos.nombreUsuario}>Hola, {usuario?.nombre}</span>
          <button style={estilos.botonLogout} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>

      <MapContainer
        center={BOGOTA}
        zoom={13}
        style={estilos.mapa}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reportes.map((r) =>
          r.ubicacion?.lat && r.ubicacion?.lng ? (
            <Marker key={r._id} position={[r.ubicacion.lat, r.ubicacion.lng]}>
              <Popup>
                <strong>{r.titulo}</strong>
                <br />
                {r.descripcion}
                <br />
                <em>{r.tipo}</em>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  )
}

const estilos = {
  contenedor: { display: 'flex', flexDirection: 'column', height: '100vh' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    background: '#1a73e8',
    color: '#fff',
    zIndex: 1000
  },
  marca: { fontWeight: 'bold', fontSize: '1.1rem' },
  navDerecha: { display: 'flex', alignItems: 'center', gap: '1rem' },
  nombreUsuario: { fontSize: '0.9rem' },
  botonLogout: {
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.5)',
    color: '#fff',
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  mapa: { flex: 1 }
}

export default MapPage