import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { cliente, formatar } from '../api/cliente'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

function Estrelas({ nota, tamanho = '0.9rem' }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(nota) ? '#f59e0b' : '#1e2d45', fontSize: tamanho }}>
          {i <= Math.round(nota) ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}

export function Product() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const navigate = useNavigate()
  const { adicionar } = useCart()
  const { logado } = useAuth()
  const toast = useToast()

  const [produto, setProduto] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [qtd, setQtd] = useState(1)

  const [avaliacoes, setAvaliacoes] = useState([])
  const [media, setMedia] = useState(0)
  const [totalAv, setTotalAv] = useState(0)

  const [modalAberto, setModalAberto] = useState(false)
  const [nota, setNota] = useState(0)
  const [tituloAv, setTituloAv] = useState('')
  const [textoAv, setTextoAv] = useState('')
  const [erroAv, setErroAv] = useState('')
  const [enviandoAv, setEnviandoAv] = useState(false)

  useEffect(() => {
    if (!id) { navigate('/'); return }
    carregarProduto()
  }, [id])

  const carregarProduto = async () => {
    setCarregando(true)
    const res = await cliente.buscar(`/products/${id}`)
    setCarregando(false)
    if (res.success) { setProduto(res.data); carregarAvaliacoes() }
  }

  const carregarAvaliacoes = async () => {
    const res = await cliente.buscar(`/avaliacoes/${id}`)
    if (res.success) {
      setAvaliacoes(res.data.avaliacoes || [])
      setMedia(res.data.media || 0)
      setTotalAv(res.data.total || 0)
    }
  }

  const adicionarCarrinho = () => {
    adicionar(produto, qtd)
    toast.sucesso(`"${produto.name}" adicionado ao carrinho!`)
  }

  const enviarAvaliacao = async () => {
    if (!nota)     { setErroAv('Selecione uma nota.'); return }
    if (!tituloAv) { setErroAv('Digite um título.'); return }
    if (!textoAv)  { setErroAv('Escreva um comentário.'); return }
    setEnviandoAv(true)
    const res = await cliente.enviar(`/avaliacoes/${id}`, { nota, titulo: tituloAv, texto: textoAv })
    setEnviandoAv(false)
    if (res.success) {
      setModalAberto(false); setNota(0); setTituloAv(''); setTextoAv('')
      toast.sucesso('Avaliação enviada! Obrigado 😊')
      carregarAvaliacoes()
    } else {
      setErroAv(res.message || 'Erro ao enviar avaliação.')
    }
  }

  if (carregando) return (
    <div className="container py-5">
      <div className="loading-overlay"><div className="spinner" /><span>Carregando produto...</span></div>
    </div>
  )

  if (!produto) return (
    <div className="container py-5">
      <div className="empty-state">
        <div className="empty-icon">⚠</div>
        <h4>Produto não encontrado</h4>
        <Link to="/" className="btn-destaque mt-3 d-inline-block">← Voltar</Link>
      </div>
    </div>
  )

  const clsCategoria = { mouse: 'badge-mouse', teclado: 'badge-teclado', headset: 'badge-headset' }[produto.category] || ''
  const estoqueTexto = produto.stock === 0 ? 'Esgotado' : produto.stock <= 5 ? `Apenas ${produto.stock} em estoque!` : `${produto.stock} em estoque`
  const estoqueClasse = produto.stock === 0 ? 'esgotado' : produto.stock <= 5 ? 'baixo' : ''
  const estoqueIcone = produto.stock === 0 ? '❌' : produto.stock <= 5 ? '⚠' : '✓'

  const contagem = [0,0,0,0,0]
  avaliacoes.forEach(a => contagem[a.nota - 1]++)

  return (
    <div className="container py-4">
      <nav style={{ fontSize: '0.82rem', color: 'var(--cor-texto-suave)', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--cor-texto-suave)' }}>Produtos</Link> ›{' '}
        <span className={`badge-categoria ${clsCategoria}`}>{formatar.categoria(produto.category)}</span> ›{' '}
        <span style={{ color: 'var(--cor-texto-secundario)' }}>{produto.name}</span>
      </nav>

      <div className="row g-4 align-items-start">
        <div className="col-lg-5">
          <div style={{ background: 'var(--cor-fundo-cartao)', border: '1px solid var(--cor-borda)', borderRadius: 'var(--raio-g)', overflow: 'hidden', aspectRatio: '4/3' }}>
            <img src={produto.image} alt={produto.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://placehold.co/600x450/111827/00d4ff?text=Produto' }} />
          </div>
        </div>

        <div className="col-lg-7">
          <span className={`badge-categoria ${clsCategoria}`} style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {formatar.categoria(produto.category)}
          </span>
          <h1 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.5rem' }}>
            {produto.name}
          </h1>

          {totalAv > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{media.toFixed(1)}</span>
              <div>
                <Estrelas nota={media} />
                <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-suave)' }}>{totalAv} avaliação{totalAv > 1 ? 'ões' : ''}</div>
              </div>
            </div>
          )}

          <div style={{ fontSize: '2.2rem', fontFamily: 'var(--fonte-titulo)', fontWeight: 700, color: 'var(--cor-destaque)', marginBottom: '0.5rem' }}>
            {formatar.moeda(produto.price)}
          </div>
          <span className={`estoque-produto ${estoqueClasse}`} style={{ fontSize: '0.85rem', display: 'block', marginBottom: '1.5rem' }}>
            {estoqueIcone} {estoqueTexto}
          </span>

          <div style={{ background: 'var(--cor-fundo-secundario)', border: '1px solid var(--cor-borda)', borderRadius: 'var(--raio-m)', padding: '1.2rem', marginBottom: '1.5rem' }}>
            <h5 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '0.95rem', color: 'var(--cor-texto-secundario)', marginBottom: '0.5rem' }}>DESCRIÇÃO</h5>
            <p style={{ color: 'var(--cor-texto-principal)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{produto.description}</p>
          </div>

          {produto.stock > 0 ? (
            <>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.875rem' }}>Quantidade:</span>
                <div className="controle-quantidade">
                  <button className="btn-quantidade" onClick={() => setQtd(v => Math.max(1, v - 1))}>−</button>
                  <span className="valor-quantidade">{qtd}</span>
                  <button className="btn-quantidade" onClick={() => setQtd(v => Math.min(produto.stock, v + 1))}>+</button>
                </div>
                <span style={{ color: 'var(--cor-texto-suave)', fontSize: '0.8rem' }}>(máx. {produto.stock})</span>
              </div>
              <div style={{ color: 'var(--cor-texto-secundario)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Subtotal: <strong style={{ color: 'var(--cor-destaque)' }}>{formatar.moeda(produto.price * qtd)}</strong>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn-destaque" style={{ padding: '0.65rem 1.5rem' }} onClick={adicionarCarrinho}>
                  🛒 Adicionar ao Carrinho
                </button>
                <Link to="/" className="btn-fantasma" style={{ padding: '0.65rem 1.25rem' }}>← Voltar</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--raio-p)', padding: '0.75rem 1rem', color: '#f87171', marginBottom: '1rem' }}>
                ❌ Produto indisponível no momento.
              </div>
              <Link to="/" className="btn-fantasma">← Ver outros produtos</Link>
            </>
          )}
        </div>
      </div>

      {/* Seção de avaliações */}
      <div style={{ marginTop: '3rem' }}>
        <div className="titulo-secao">⭐ Avaliações dos Clientes</div>

        <div className="row g-4 mb-4">
          {totalAv > 0 && (
            <div className="col-md-4">
              <div style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '3rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{media.toFixed(1)}</div>
                  <Estrelas nota={media} tamanho="1rem" />
                  <div style={{ fontSize: '0.8rem', color: '#4a5870', marginTop: 4 }}>{totalAv} avaliação{totalAv > 1 ? 'ões' : ''}</div>
                </div>
                {[5,4,3,2,1].map(n => {
                  const pct = totalAv > 0 ? (contagem[n - 1] / totalAv * 100) : 0
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: '#8a9bbf', minWidth: 12 }}>{n}</span>
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
                      <div style={{ flex: 1, background: '#1e2d45', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fcd34d)', borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#4a5870', minWidth: 24 }}>{contagem[n - 1]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className={totalAv > 0 ? 'col-md-8' : 'col-12'}>
            {logado ? (
              <div style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#8a9bbf' }}>Comprou este produto? Deixe sua avaliação!</span>
                <button className="btn-destaque" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => { setModalAberto(true); setNota(0); setTituloAv(''); setTextoAv(''); setErroAv('') }}>
                  ⭐ Avaliar
                </button>
              </div>
            ) : (
              <div style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 12, padding: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#4a5870' }}>
                🔒 <Link to="/login" style={{ color: '#00d4ff' }}>Faça login</Link> para avaliar este produto.
              </div>
            )}

            {avaliacoes.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-icon" style={{ fontSize: '2rem' }}>💬</div>
                <h4 style={{ fontSize: '1rem' }}>Nenhuma avaliação ainda</h4>
                <p>Seja o primeiro a avaliar!</p>
              </div>
            ) : avaliacoes.map(av => (
              <div key={av.id} style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{av.nomeAutor}</div>
                    <Estrelas nota={av.nota} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#4a5870' }}>{formatar.data(av.createdAt)}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{av.titulo}</div>
                <div style={{ fontSize: '0.85rem', color: '#8a9bbf', lineHeight: 1.5 }}>{av.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de avaliação */}
      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}
          onClick={e => e.target === e.currentTarget && setModalAberto(false)}>
          <div style={{ background: 'var(--cor-fundo-cartao)', border: '1px solid var(--cor-borda)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480, margin: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h5 style={{ margin: 0, fontFamily: 'var(--fonte-titulo)' }}>⭐ Avaliar Produto</h5>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', color: 'var(--cor-texto-suave)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="mb-3">
              <label className="form-label">Sua nota</label>
              <div style={{ display: 'flex', gap: 4, fontSize: '1.8rem' }}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ cursor: 'pointer', color: n <= nota ? '#f59e0b' : '#4a5870' }}
                    onClick={() => setNota(n)}>{n <= nota ? '★' : '☆'}</span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input type="text" className="form-control" placeholder="Resumo da sua experiência"
                value={tituloAv} onChange={e => { setTituloAv(e.target.value); setErroAv('') }} />
            </div>
            <div className="mb-3">
              <label className="form-label">Comentário</label>
              <textarea className="form-control" rows={3} placeholder="Conte o que achou do produto..."
                value={textoAv} onChange={e => { setTextoAv(e.target.value); setErroAv('') }} />
            </div>
            {erroAv && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.6rem 0.9rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{erroAv}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn-fantasma" onClick={() => setModalAberto(false)}>Cancelar</button>
              <button className="btn-destaque" onClick={enviarAvaliacao} disabled={enviandoAv}>
                {enviandoAv ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
