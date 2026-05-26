import { useEffect, useState } from 'react'
import { obtenerReportes, crearReporte } from '../../services/reports.service'
import { obtenerZonas } from '../../services/zones.service'
import Navbar from './Navbar'
import MapView from './MapView'
import FormularioReporte from './FormularioReporte'

export default function MapPage() {
  const [reportes, setReportes]                   = useState([])
  const [zonas, setZonas]                         = useState([])
  const [filtro, setFiltro]                       = useState('todos')
  const [creandoReporte, setCreandoReporte]       = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [posicionNueva, setPosicionNueva]         = useState(null)
  const [miUbicacion, setMiUbicacion]             = useState(null)
  const [enviando, setEnviando]                   = useState(false)
  const [nuevoReporte, setNuevoReporte]           = useState({ titulo: '', descripcion: '', tipo: 'accidente' })

  useEffect(() => {
    obtenerReportes().then(({ data }) => setReportes(data)).catch(() => {})
    obtenerZonas().then(({ data }) => setZonas(data)).catch(() => {})
  }, [])

  const tipos = ['todos', ...new Set(reportes.map(r => r.tipo).filter(Boolean))]
  const reportesFiltrados = filtro === 'todos' ? reportes : reportes.filter(r => r.tipo === filtro)

  const handleCrear = async () => {
    if (!posicionNueva) return
    setEnviando(true)
    try {
      const { data } = await crearReporte({
        titulo:      nuevoReporte.titulo || 'Nuevo reporte',
        descripcion: nuevoReporte.descripcion || '',
        tipo:        nuevoReporte.tipo,
        ubicacion:   { lat: posicionNueva.lat, lng: posicionNueva.lng, direccion: '' },
      })
      setReportes(prev => [...prev, data])
    } catch (err) {
      console.error('Error al crear reporte:', err)
    } finally {
      setEnviando(false)
      setMostrarFormulario(false)
      setCreandoReporte(false)
      setPosicionNueva(null)
      setNuevoReporte({ titulo: '', descripcion: '', tipo: 'accidente' })
    }
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
    setCreandoReporte(false)
    setPosicionNueva(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f4f8' }}>
      <Navbar
        filtro={filtro} setFiltro={setFiltro}
        tipos={tipos} totalReportes={reportesFiltrados.length}
      />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          reportes={reportesFiltrados}
          zonas={zonas}
          miUbicacion={miUbicacion}
          setMiUbicacion={setMiUbicacion}
          posicionNueva={posicionNueva}
          setPosicionNueva={setPosicionNueva}
          setMostrarFormulario={setMostrarFormulario}
          creandoReporte={creandoReporte}
          tipoNuevo={nuevoReporte.tipo}
        />

        {mostrarFormulario && posicionNueva && (
          <FormularioReporte
            nuevoReporte={nuevoReporte}
            setNuevoReporte={setNuevoReporte}
            enviando={enviando}
            onCrear={handleCrear}
            onCancelar={handleCancelar}
          />
        )}

        <button
          style={{
            position: 'absolute', bottom: '65px', right: '16px',
            width: '44px', height: '44px', borderRadius: '12px', border: 'none',
            color: '#fff', cursor: 'pointer', fontSize: '20px', zIndex: 1200,
            background: creandoReporte ? '#1565c0' : 'rgba(5,18,40,0.85)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
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