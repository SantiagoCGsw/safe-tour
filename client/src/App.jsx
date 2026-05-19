import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import MapPage from './pages/Map/MapPage'

const RutaProtegida = ({ children }) => {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  return usuario ? children : <Navigate to="/login" />
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App