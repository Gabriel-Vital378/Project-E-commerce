import { useState, useEffect, useCallback } from 'react'
import { cliente, formatar } from '../api/cliente'
import { useToast } from '../contexts/ToastContext'

const CORES_STATUS = {
  confirmado: { bg: 'rgba(16,185,129,0.12)', cor: '#10b981', borda: 'rgba(16,185,129,0.25)' },
  em_preparo: { bg: 'rgba(0,212,255,0.12)',  cor: '#00d4ff', borda: 'rgba(0,212,255,0.25)' },
  enviado:    { bg: 'rgba(168,85,247,0.12)', cor: '#a855f7', borda: 'rgba(168,85,247,0.25)' },
  entregue:   { bg: 'rgba(16,185,129,0.12)', cor: '#10b981', borda: 'rgba(16,185,129,0.25)' },
  cancelado:  { bg: 'rgba(239,68,68,0.12)',  cor: '#ef4444', borda: 'rgba(239,68,68,0.25)'  },
}

function BadgeStatus({ status }) {
  const s = CORES_STATUS[status] || CORES_STATUS.confirmado
  return <span style={{ padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: s.bg, color: s.cor, border: `1px solid ${s.borda}`, whiteSpace: 'nowrap' }}>{status.replace('_', ' ')}</span>
}

const FORM_VAZIO = { name: '', category: '', price: '', stock: '', description: '', image: '' }

export function Admin() {
  const [aba, setAba] = useState('produtos')
  const [produtos, setProdutos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [modal, setModal] = useState(null) // null | { modo: 'novo'|'editar', produto }
  const [form, setForm] = useState(FORM_VAZIO)
  const [formErro, setFormErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [idExcluir, setIdExcluir] = useState(null)
  const [pedidoAberto, setPedidoAberto] = useState(null)
  const toast = useToast()

  const setF = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }))

  const carregarProdutos = useCallback(async () => {
    setCarregando(true)
    const res = await cliente.buscar('/products?limit=100')
    setCarregando(false)
    if (res.success) setProdutos(res.data || [])
  }, [])

  const carregarPedidos = useCallback(async () => {
    setCarregando(true)
    const res = await cliente.buscar('/orders')
    setCarregando(false)
    if (res.success) setPedidos(res.data || [])
  }, [])

  const carregarAvaliacoes = useCallback(async () => {
    setCarregando(true)
    const res = await cliente.buscar('/avaliacoes')
    setCarregando(false)
    if (res.success) setAvaliacoes(res.data || [])
  }, [])

  useEffect(() => {
    if (aba === 'produtos') carregarProdutos()
    else if (aba === 'pedidos') carregarPedidos()
    else if (aba === 'avaliacoes') carregarAvaliacoes()
  }, [aba])

  const abrirNovo = () => { setForm(FORM_VAZIO); setFormErro(''); setModal({ modo: 'novo' }) }
  const abrirEditar = (p) => {
    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), description: p.description, image: p.image || '' })
    setFormErro('')
    setModal({ modo: 'editar', produto: p })
  }

  const salvar = async () => {
    if (!form.name.trim()) { setFormErro('Nome é obrigatório.'); return }
    if (!form.category) { setFormErro('Categoria é obrigatória.'); return }
    if (!form.price || isNaN(form.price)) { setFormErro('Preço inválido.'); return }
    if (!form.stock || isNaN(form.stock)) { setFormErro('Estoque inválido.'); return }
    if (!form.description.trim()) { setFormErro('Descrição é obrigatória.'); return }

    setSalvando(true)
    const corpo = { name: form.name, category: form.category, price: parseFloat(form.price), stock: parseInt(form.stock), description: form.description, image: form.image || undefined }

    let res
    if (modal.modo === 'novo') {
      res = await cliente.enviar('/products', corpo)
    } else {
      res = await cliente.requisitar(`/products/${modal.produto.id}`, { method: 'PUT', body: JSON.stringify(corpo) })
    }
    setSalvando(false)

    if (res.success) {
      setModal(null)
      toast.sucesso(modal.modo === 'novo' ? 'Produto criado!' : 'Produto atualizado!')
      carregarProdutos()
    } else {
      setFormErro(res.message || 'Erro ao salvar produto.')
    }
  }

  const excluir = async () => {
    const res = await cliente.requisitar(`/products/${idExcluir}`, { method: 'DELETE' })
    setIdExcluir(null)
    if (res.success) { toast.sucesso('Produto excluído!'); carregarProdutos() }
    else toast.erro(res.message || 'Erro ao excluir produto.')
  }

  const excluirAvaliacao = async (id) => {
    if (!window.confirm('Excluir esta avaliação?')) return
    const res = await cliente.requisitar(`/avaliacoes/${id}`, { method: 'DELETE' })
    if (res.success) { toast.sucesso('Avaliação excluída.'); carregarAvaliacoes() }
    else toast.erro(res.message || 'Erro ao excluir avaliação.')
  }

  const thStyle = { background: '#0f1520', color: '#5a7090', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.7rem 1rem', borderBottom: '1px solid #1a2535' }
  const tdStyle = { padding: '0.7rem 1rem', borderBottom: '1px solid rgba(26,37,53,0.6)', color: '#c8d4e8', fontSize: '0.855rem' }

  return (
    <div className="container py-4">
      <div className="cabecalho-pagina d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h1>⚙ Painel <span>Admin</span></h1>
          <p style={{ color: '#5a7090', fontSize: '0.875rem', margin: 0 }}>Gerencie produtos, pedidos e avaliações</p>
        </div>
        {aba === 'produtos' && <button className="btn-destaque" onClick={abrirNovo}>+ Novo Produto</button>}
      </div>

      <div className="abas-filtro mb-0">
        {[['produtos','📦 Produtos'],['pedidos','🛍 Pedidos'],['avaliacoes','⭐ Avaliações']].map(([id, label]) => (
          <button key={id} className={`aba-filtro${aba === id ? ' ativa' : ''}`} onClick={() => setAba(id)}>{label}</button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {carregando && <div className="loading-overlay"><div className="spinner" /><span>Carregando...</span></div>}

        {/* ABA PRODUTOS */}
        {!carregando && aba === 'produtos' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#','Imagem','Nome','Categoria','Preço','Estoque','Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id} style={{ cursor: 'default' }}>
                    <td style={tdStyle}>{p.id}</td>
                    <td style={tdStyle}>
                      <img src={p.image} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #1a2535' }}
                        onError={e => { e.target.src = 'https://placehold.co/40x40/111827/00d4ff?text=P' }} />
                    </td>
                    <td style={tdStyle}><span style={{ fontWeight: 500 }}>{p.name}</span></td>
                    <td style={tdStyle}><span className={`badge-categoria badge-${p.category}`}>{formatar.categoria(p.category)}</span></td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--fonte-titulo)', color: '#00d4ff', fontWeight: 600 }}>{formatar.moeda(p.price)}</td>
                    <td style={{ ...tdStyle, color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#10b981' }}>{p.stock}</td>
                    <td style={tdStyle}>
                      <div className="d-flex gap-2">
                        <button className="btn-fantasma" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }} onClick={() => abrirEditar(p)}>✏ Editar</button>
                        <button className="btn-perigo-suave" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem' }} onClick={() => setIdExcluir(p.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length === 0 && (
              <div className="empty-state"><div className="empty-icon">📦</div><h4>Nenhum produto cadastrado</h4></div>
            )}
          </div>
        )}

        {/* ABA PEDIDOS */}
        {!carregando && aba === 'pedidos' && (
          <div className="d-flex flex-column gap-2">
            {pedidos.length === 0 && <div className="empty-state"><div className="empty-icon">🛍</div><h4>Nenhum pedido</h4></div>}
            {pedidos.map(pedido => (
              <div key={pedido.id} style={{ background: '#111827', border: '1px solid #1a2535', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#0d1525', padding: '0.75rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #1a2535', cursor: 'pointer' }}
                  onClick={() => setPedidoAberto(pedidoAberto === pedido.id ? null : pedido.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600 }}>Pedido #{pedido.id}</span>
                    <span style={{ fontSize: '0.8rem', color: '#4a5870' }}>{formatar.data(pedido.createdAt)}</span>
                    <BadgeStatus status={pedido.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#5a7090' }}>👤 {pedido.user?.name || pedido.userId}</span>
                    <span style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 700, color: '#00d4ff' }}>{formatar.moeda(pedido.total)}</span>
                    <span style={{ color: '#5a7090' }}>{pedidoAberto === pedido.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {pedidoAberto === pedido.id && (
                  <div style={{ padding: '0.75rem 1.1rem' }}>
                    {(pedido.orderItems || []).map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #1a2535' }}>
                        <img src={item.product?.image || ''} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #1a2535' }}
                          onError={e => { e.target.src = 'https://placehold.co/40x40/111827/00d4ff?text=P' }} />
                        <div style={{ flex: 1, fontSize: '0.875rem' }}>{item.product?.name || 'Produto'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4a5870' }}>{item.quantity}×</div>
                        <div style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600 }}>{formatar.moeda(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA AVALIAÇÕES */}
        {!carregando && aba === 'avaliacoes' && (
          <div>
            {avaliacoes.length === 0 && <div className="empty-state"><div className="empty-icon">⭐</div><h4>Nenhuma avaliação</h4></div>}
            <div className="d-flex flex-column gap-2">
              {avaliacoes.map(av => (
                <div key={av.id} style={{ background: '#111827', border: '1px solid #1a2535', borderRadius: 12, padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{av.nomeAutor}</span>
                        <span style={{ fontSize: '0.75rem', color: '#4a5870' }}>→ produto #{av.productId}</span>
                        <span style={{ color: '#f59e0b' }}>{'★'.repeat(av.nota)}{'☆'.repeat(5 - av.nota)}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{av.titulo}</div>
                      <div style={{ fontSize: '0.85rem', color: '#8a9bbf' }}>{av.texto}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: '#4a5870' }}>{formatar.data(av.createdAt)}</span>
                      <button className="btn-perigo-suave" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={() => excluirAvaliacao(av.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal produto */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, overflowY: 'auto', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: 'var(--cor-fundo-cartao)', border: '1px solid var(--cor-borda)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h5 style={{ margin: 0, fontFamily: 'var(--fonte-titulo)' }}>{modal.modo === 'novo' ? 'Novo Produto' : 'Editar Produto'}</h5>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--cor-texto-suave)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nome do produto *</label>
                <input type="text" className="form-control" placeholder="Ex: Mouse Logitech G502" value={form.name} onChange={e => setF('name', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Categoria *</label>
                <select className="form-select" value={form.category} onChange={e => setF('category', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="mouse">Mouse</option>
                  <option value="teclado">Teclado</option>
                  <option value="headset">Headset</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Preço (R$) *</label>
                <input type="number" className="form-control" placeholder="299.90" step="0.01" min="0" value={form.price} onChange={e => setF('price', e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Estoque *</label>
                <input type="number" className="form-control" placeholder="10" min="0" value={form.stock} onChange={e => setF('stock', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Descrição *</label>
                <textarea className="form-control" rows={3} placeholder="Descreva o produto..." value={form.description} onChange={e => setF('description', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">URL da imagem</label>
                <input type="url" className="form-control" placeholder="https://..." value={form.image} onChange={e => setF('image', e.target.value)} />
                {form.image && (
                  <img src={form.image} style={{ height: 80, borderRadius: 8, marginTop: 8, border: '1px solid #1a2535' }}
                    onError={e => { e.target.style.display = 'none' }} />
                )}
              </div>
            </div>

            {formErro && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.65rem 0.9rem', color: '#f87171', fontSize: '0.875rem', marginTop: '1rem' }}>{formErro}</div>}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn-fantasma" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-destaque" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal exclusão */}
      {idExcluir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div style={{ background: 'var(--cor-fundo-cartao)', border: '1px solid var(--cor-borda)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 380, margin: '0 1rem' }}>
            <h5 style={{ color: 'var(--cor-erro)', margin: '0 0 1rem' }}>🗑 Excluir Produto</h5>
            <p style={{ color: '#8a9bbf', fontSize: '0.9rem' }}>
              Tem certeza que deseja excluir <strong style={{ color: '#c8d4e8' }}>
                {produtos.find(p => p.id === idExcluir)?.name}
              </strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn-fantasma" onClick={() => setIdExcluir(null)}>Cancelar</button>
              <button style={{ background: 'var(--cor-erro)', color: '#fff', border: 'none', borderRadius: 'var(--raio-p)', padding: '0.4rem 1rem', cursor: 'pointer' }} onClick={excluir}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
