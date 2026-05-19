import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

function ToastContainer({ toasts }) {
  const icones = { sucesso: '✓', erro: '✕', info: 'ℹ', aviso: '⚠' }
  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.tipo}`}>
          <span className="toast-icon">{icones[t.tipo] || 'ℹ'}</span>
          <span className="toast-msg">{t.mensagem}</span>
        </div>
      ))}
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const mostrar = useCallback((mensagem, tipo = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, mensagem, tipo }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800)
  }, [])

  return (
    <ToastContext.Provider value={{
      sucesso: m => mostrar(m, 'sucesso'),
      erro:    m => mostrar(m, 'erro'),
      info:    m => mostrar(m, 'info'),
      aviso:   m => mostrar(m, 'aviso'),
    }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
