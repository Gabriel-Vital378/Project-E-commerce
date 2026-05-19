import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { entrar, logado, eAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (logado) navigate(eAdmin ? '/admin' : '/', { replace: true })
  }, [logado, eAdmin, navigate])

  const validar = () => {
    const e = {}
    if (!email) e.email = 'O email é obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Digite um email válido.'
    if (!senha) e.senha = 'A senha é obrigatória.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev?.preventDefault()
    setErroGeral('')
    if (!validar()) return
    setCarregando(true)
    const res = await entrar(email, senha)
    setCarregando(false)
    if (!res.success) setErroGeral(res.message || 'Email ou senha incorretos.')
  }

  return (
    <div className="container-auth">
      <div className="cartao-auth">
        <div className="logo-auth">⌨ ZYRON</div>
        <p className="subtitulo-auth">Faça login na sua conta</p>

        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="email" className={`form-control${erros.email ? ' campo-erro' : ''}`}
              placeholder="seu@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setErros(p => ({ ...p, email: '' })); setErroGeral('') }} />
            {erros.email && <span className="msg-erro-inline visivel">⚠ {erros.email}</span>}
          </div>

          <div className="mb-3">
            <label className="form-label">Senha <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input type={mostrarSenha ? 'text' : 'password'}
                className={`form-control${erros.senha ? ' campo-erro' : ''}`}
                placeholder="••••••••" value={senha}
                onChange={e => { setSenha(e.target.value); setErros(p => ({ ...p, senha: '' })); setErroGeral('') }} />
              <button type="button" onClick={() => setMostrarSenha(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--cor-texto-suave)', cursor: 'pointer' }}>
                👁
              </button>
            </div>
            {erros.senha && <span className="msg-erro-inline visivel">⚠ {erros.senha}</span>}
          </div>

          {erroGeral && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.65rem 0.9rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {erroGeral}
            </div>
          )}

          <button type="submit" className="btn-destaque w-100 py-2 mt-1" disabled={carregando}>
            {carregando ? 'Aguarde...' : 'Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0', color: '#4a5870', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: 1, background: '#1e2d45' }} />
          ou
          <div style={{ flex: 1, height: 1, background: '#1e2d45' }} />
        </div>

        <p className="text-center" style={{ fontSize: '0.875rem', color: '#4a5870' }}>
          Não tem conta? <Link to="/cadastro" style={{ color: '#00d4ff', fontWeight: 500 }}>Cadastre-se grátis</Link>
        </p>

        <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: '#111827', borderRadius: 6, border: '1px dashed #1e2d45', fontSize: '0.75rem', color: '#4a5870' }}>
          <strong style={{ color: '#8a9bbf', display: 'block', marginBottom: 4 }}>🧪 Contas de teste</strong>
          Admin: admin@perifericos.com / admin123<br />
          Cliente: cliente@email.com / cliente123
        </div>
      </div>
    </div>
  )
}
