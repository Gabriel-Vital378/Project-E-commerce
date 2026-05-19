import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, adminOnly = false }) {
  const { logado, eAdmin } = useAuth()
  if (!logado) return <Navigate to="/login" replace />
  if (adminOnly && !eAdmin) return <Navigate to="/" replace />
  return children
}
