import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'

export function Navbar() {
  const { logado, eAdmin, sair } = useAuth()
  const { quantidade } = useCart()
  const { tema, alternar } = useTheme()
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  const pesquisar = (e) => {
    if (e.key === 'Enter' && busca.trim()) {
      navigate(`/?busca=${encodeURIComponent(busca.trim())}`)
    }
  }

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
          ⌨ <span>ZYRON</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menu-nav">
          <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '1.3rem' }}>☰</span>
        </button>

        <div className="collapse navbar-collapse" id="menu-nav">
          <div className="busca-wrapper mx-auto my-2 my-lg-0">
            <span className="icone-busca">🔍</span>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={pesquisar}
              autoComplete="off"
            />
          </div>

          <div className="d-flex align-items-center gap-2 ms-lg-3">
            {logado ? (
              <>
                <Link to="/carrinho" className="btn-carrinho text-decoration-none">
                  🛒 Carrinho{' '}
                  {quantidade > 0 && (
                    <span id="badge-carrinho" style={{ display: 'inline-flex' }}>{quantidade}</span>
                  )}
                </Link>
                {eAdmin && <Link to="/admin" className="btn-fantasma">⚙ Admin</Link>}
                <Link to="/pedidos" className="btn-fantasma">📦 Meus Pedidos</Link>
                <button onClick={sair} className="btn-perigo-suave">Sair</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-fantasma">Entrar</Link>
                <Link to="/cadastro" className="btn-destaque">Cadastrar</Link>
              </>
            )}
            <button className="btn-tema" onClick={alternar} title="Alternar tema">
              {tema === 'claro' ? '🌙' : '☀'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
