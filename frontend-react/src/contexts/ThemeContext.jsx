import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'escuro')

  useEffect(() => {
    document.documentElement.dataset.tema = tema === 'claro' ? 'claro' : ''
    localStorage.setItem('tema', tema)
  }, [tema])

  const alternar = () => setTema(t => t === 'claro' ? 'escuro' : 'claro')

  return (
    <ThemeContext.Provider value={{ tema, alternar }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
