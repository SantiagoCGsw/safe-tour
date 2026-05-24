import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import MapPage from './pages/Map/MapPage'
import ProfilePage from './pages/Profile/ProfilePage'
import GestorPage from './pages/Gestor/GestorPage'
import AdminDashboard from './pages/Admin/AdminDashboard'

const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  return usuario ? children : <Navigate to="/login" />
}

const RutaRol = ({ children, roles }) => {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (!usuario) return <Navigate to="/login" />
  if (!roles.includes(usuario.rol)) return <Navigate to="/mapa" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/mapa"
          element={
            <RutaProtegida>
              <MapPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <ProfilePage />
            </RutaProtegida>
          }
        />
        <Route
          path="/gestor"
          element={
            <RutaRol roles={['gestor', 'admin']}>
              <GestorPage />
            </RutaRol>
          }
        />
        <Route
          path="/admin"
          element={
            <RutaRol roles={['admin']}>
              <AdminDashboard />
            </RutaRol>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App