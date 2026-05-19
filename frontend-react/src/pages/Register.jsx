import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cliente } from '../api/cliente'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmar: '' })
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { logado } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => { if (logado) navigate('/', { replace: true }) }, [logado, navigate])

  const set = (campo, valor) => {
    setForm(p => ({ ...p, [campo]: valor }))
    setErros(p => ({ ...p, [campo]: '' }))
    setErroGeral('')
  }

  const validar = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'O nome é obrigatório.'
    if (!form.email) e.email = 'O email é obrigatório.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Digite um email válido.'
    if (!form.password) e.password = 'A senha é obrigatória.'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.'
    if (form.password !== form.confirmar) e.confirmar = 'As senhas não coincidem.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setErroGeral('')
    if (!validar()) return
    setCarregando(true)
    const res = await cliente.enviar('/auth/register', { name: form.name, email: form.email, password: form.password })
    setCarregando(false)
    if (res.success) {
      toast.sucesso('Conta criada! Faça login para continuar.')
      navigate('/login')
    } else {
      setErroGeral(res.message || 'Erro ao criar conta.')
    }
  }

  const campo = (id, label, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label">{label} <span style={{ color: '#ef4444' }}>*</span></label>
      <input type={type} className={`form-control${erros[id] ? ' campo-erro' : ''}`}
        placeholder={placeholder} value={form[id]}
        onChange={e => set(id, e.target.value)} />
      {erros[id] && <span className="msg-erro-inline visivel">⚠ {erros[id]}</span>}
    </div>
  )

  return (
    <div className="container-auth">
      <div className="cartao-auth">
        <div className="logo-auth">⌨ ZYRON</div>
        <p className="subtitulo-auth">Crie sua conta grátis</p>

        <form onSubmit={submit} noValidate>
          {campo('name', 'Nome completo', 'text', 'Seu nome')}
          {campo('email', 'Email', 'email', 'seu@email.com')}
          {campo('password', 'Senha', 'password', '••••••••')}
          {campo('confirmar', 'Confirmar senha', 'password', '••••••••')}

          {erroGeral && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.65rem 0.9rem', color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {erroGeral}
            </div>
          )}

          <button type="submit" className="btn-destaque w-100 py-2 mt-1" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.875rem', color: '#4a5870' }}>
          Já tem conta? <Link to="/login" style={{ color: '#00d4ff', fontWeight: 500 }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}
