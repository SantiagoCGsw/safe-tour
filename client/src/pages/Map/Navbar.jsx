import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ filtro, setFiltro, tipos, totalReportes }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const initials = usuario?.nombre
    ?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav style={s.navbar}>
      <div style={s.navLeft}>
        <span style={s.marca}>Safe Tour</span>
        <div style={s.contador}>{totalReportes}</div>
        <div style={s.filtros}>
          {tipos.slice(0, 5).map(t => (
            <button key={t} onClick={() => setFiltro(t)}
              style={{ ...s.filtroBtn, background: filtro === t ? 'rgba(100,180,255,0.25)' : 'transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={s.navRight}>
        <div style={{ ...s.avatar, cursor: 'pointer' }} onClick={() => navigate('/perfil')} title="Perfil">
          {initials}
        </div>
        {(usuario?.rol === 'gestor' || usuario?.rol === 'admin') && (
          <button style={s.botonNav} onClick={() => navigate('/gestor')}>Gestor</button>
        )}
        {usuario?.rol === 'admin' && (
          <button style={s.botonNav} onClick={() => navigate('/admin')}>Admin</button>
        )}
        <button style={s.botonSalir} onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  )
}

const s = {
  navbar:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', height: '58px', background: 'rgba(5,18,40,0.95)' },
  navLeft:   { display: 'flex', alignItems: 'center', gap: '1rem' },
  marca:     { color: '#fff', fontWeight: '700' },
  contador:  { minWidth: '34px', height: '34px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' },
  filtros:   { display: 'flex', gap: '6px' },
  filtroBtn: { padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' },
  navRight:  { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar:    { width: '34px', height: '34px', borderRadius: '50%', background: '#1565c0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  botonNav:  { padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'rgba(100,180,255,0.15)', color: '#64b4ff', cursor: 'pointer', fontSize: '13px' },
  botonSalir:{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: '#1565c0', color: '#fff', cursor: 'pointer' },
}