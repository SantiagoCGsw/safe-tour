import { useEffect, useState } from 'react'
import { obtenerReportes, crearReporte } from '../../services/reports.service'
import { obtenerZonas } from '../../services/zones.service'
import { crearPost } from '../../services/posts.service'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import MapView from './MapView'
import FormularioReporte from './FormularioReporte'

export default function MapPage() {
  const { usuario } = useAuth()

  const [reportes, setReportes]                   = useState([])
  const [zonas, setZonas]                         = useState([])
  const [filtro, setFiltro]                       = useState('todos')
  const [creandoReporte, setCreandoReporte]       = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [posicionNueva, setPosicionNueva]         = useState(null)
  const [miUbicacion, setMiUbicacion]             = useState(null)
  const [enviando, setEnviando]                   = useState(false)
  const [nuevoReporte, setNuevoReporte]           = useState({ titulo: '', descripcion: '', tipo: 'accidente' })
  const [modoNoche, setModoNoche]                 = useState(true)

  // Post
  const [mostrarPost, setMostrarPost]   = useState(false)
  const [textoPost, setTextoPost]       = useState('')
  const [enviandoPost, setEnviandoPost] = useState(false)

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

  const handleCrearPost = async () => {
    if (!textoPost.trim()) return
    setEnviandoPost(true)
    try {
      await crearPost({ contenido: textoPost })
      setTextoPost('')
      setMostrarPost(false)
    } catch (err) {
      console.error('Error al crear post:', err)
    } finally {
      setEnviandoPost(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: modoNoche ? '#020b18' : '#e8edf2' }}>
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
          modoNoche={modoNoche}
          setModoNoche={setModoNoche}
        />

        {/* Formulario reporte */}
        {mostrarFormulario && posicionNueva && (
          <FormularioReporte
            nuevoReporte={nuevoReporte}
            setNuevoReporte={setNuevoReporte}
            enviando={enviando}
            onCrear={handleCrear}
            onCancelar={handleCancelar}
          />
        )}

        {/* Modal post */}
        {mostrarPost && (
          <div style={s.modalOverlay} onClick={() => setMostrarPost(false)}>
            <div style={s.modalPost} onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <span style={{ color: '#e8f4ff', fontWeight: 600 }}>Nueva publicación</span>
                <button onClick={() => setMostrarPost(false)} style={s.closeBtn}>✕</button>
              </div>
              <textarea
                placeholder="¿Qué quieres compartir con la comunidad?"
                value={textoPost}
                onChange={e => setTextoPost(e.target.value)}
                rows={4}
                style={s.textareaPost}
              />
              <button
                style={{ ...s.botonPublicar, opacity: enviandoPost || !textoPost.trim() ? 0.6 : 1 }}
                onClick={handleCrearPost}
                disabled={enviandoPost || !textoPost.trim()}
              >
                {enviandoPost ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}

        {/* Botón crear reporte */}
        <button
          style={{
            ...s.fab,
            bottom: '65px',
            background: creandoReporte ? '#1565c0' : 'rgba(5,18,40,0.85)',
          }}
          onClick={() => {
            setCreandoReporte(!creandoReporte)
            setMostrarFormulario(false)
            setPosicionNueva(null)
          }}
        >
          📋
        </button>

        {/* Botón post — solo turistas */}
        {usuario?.rol === 'turista' && (
          <button
            style={{ ...s.fab, bottom: '120px', background: mostrarPost ? '#7c3aed' : 'rgba(5,18,40,0.85)' }}
            onClick={() => setMostrarPost(true)}
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  )
}

const s = {
  fab: {
    position: 'absolute', right: '16px',
    width: '44px', height: '44px', borderRadius: '12px', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: '20px', zIndex: 1200,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    zIndex: 1500, backdropFilter: 'blur(4px)',
  },
  modalPost: {
    width: '100%', maxWidth: '480px',
    background: 'rgba(5,18,40,0.98)', borderRadius: '20px 20px 0 0',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
    border: '1px solid rgba(100,180,255,0.15)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '18px',
  },
  textareaPost: {
    padding: '12px', borderRadius: '12px',
    border: '1px solid rgba(100,180,255,0.2)',
    background: 'rgba(10,25,60,0.9)', color: '#e8f4ff',
    fontSize: '0.9rem', outline: 'none', resize: 'none',
  },
  botonPublicar: {
    padding: '12px', borderRadius: '12px', border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
    color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
  },
}