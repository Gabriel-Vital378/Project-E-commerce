import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('usuario')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const navigate = useNavigate()

  const salvar = (tk, user) => {
    localStorage.setItem('token', tk)
    localStorage.setItem('usuario', JSON.stringify(user))
    setToken(tk)
    setUsuario(user)
  }

  const entrar = async (email, password) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const dados = await resp.json()
      if (dados.success) {
        salvar(dados.data.token, dados.data.user)
        navigate(dados.data.user.role === 'admin' ? '/admin' : '/', { replace: true })
      }
      return dados
    } catch {
      return { success: false, message: 'Servidor offline ou inacessível.' }
    }
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      logado: !!token,
      eAdmin: usuario?.role === 'admin',
      entrar,
      salvar,
      sair,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
