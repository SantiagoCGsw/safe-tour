import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const datos = localStorage.getItem('usuario')
    if (datos) setUsuario(JSON.parse(datos))
    setCargando(false)
  }, [])

  const login = (datos) => {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos))
    setUsuario(datos)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)