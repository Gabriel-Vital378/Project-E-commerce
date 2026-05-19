import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { cliente, formatar } from '../api/cliente'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const CORES_STATUS = {
  confirmado: { bg: 'rgba(16,185,129,0.15)',  cor: '#10b981', borda: 'rgba(16,185,129,0.3)' },
  em_preparo: { bg: 'rgba(0,212,255,0.15)',   cor: '#00d4ff', borda: 'rgba(0,212,255,0.3)'  },
  enviado:    { bg: 'rgba(168,85,247,0.15)',  cor: '#a855f7', borda: 'rgba(168,85,247,0.3)' },
  entregue:   { bg: 'rgba(16,185,129,0.15)',  cor: '#10b981', borda: 'rgba(16,185,129,0.3)' },
  cancelado:  { bg: 'rgba(239,68,68,0.15)',   cor: '#ef4444', borda: 'rgba(239,68,68,0.3)'  },
}
const ICONE_METODO = { cartao: '💳', pix: '📱', boleto: '🔖' }
const NOME_METODO  = { cartao: 'Cartão de Crédito', pix: 'PIX', boleto: 'Boleto Bancário' }

function BadgeStatus({ status }) {
  const st = CORES_STATUS[status] || CORES_STATUS.confirmado
  return (
    <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.65rem', borderRadius: 50, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: st.bg, color: st.cor, border: `1px solid ${st.borda}` }}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function Orders() {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [idCancelar, setIdCancelar] = useState(null)
  const { usuario } = useAuth()
  const toast = useToast()
  const sseRef = useRef(null)

  useEffect(() => {
    carregarPedidos()
    conectarSSE()
    return () => sseRef.current?.close()
  }, [])

  const carregarPedidos = async () => {
    setCarregando(true)
    const res = await cliente.buscar('/orders/my')
    setCarregando(false)
    if (res.success) setPedidos(res.data || [])
  }

  const conectarSSE = () => {
    const token = localStorage.getItem('token')
    if (!token || sseRef.current) return
    const fonte = new EventSource(`/api/orders/stream?token=${encodeURIComponent(token)}`)
    sseRef.current = fonte

    fonte.onmessage = (e) => {
      const dados = JSON.parse(e.data)
      if (dados.tipo === 'conectado') return
      setPedidos(prev => {
        const idx = prev.findIndex(p => p.id === dados.pedidoId)
        if (idx === -1) { carregarPedidos(); return prev }
        const copia = [...prev]
        copia[idx] = { ...copia[idx], status: dados.status }
        return copia
      })
      toast.info(`Pedido #${dados.pedidoId} atualizado: ${dados.status.replace('_', ' ')}`)
    }
    fonte.onerror = () => { fonte.close(); sseRef.current = null }
  }

  const cancelar = async () => {
    const res = await cliente.requisitar(`/orders/${idCancelar}/cancelar`, { method: 'PATCH' })
    setIdCancelar(null)
    if (res.success) { toast.sucesso('Pedido cancelado com sucesso!'); carregarPedidos() }
    else toast.erro(res.message || 'Erro ao cancelar pedido.')
  }

  if (carregando) return (
    <div className="container py-4">
      <div className="loading-overlay"><div className="spinner" /><span>Carregando seus pedidos...</span></div>
    </div>
  )

  return (
    <div className="container py-4">
      <div className="cabecalho-pagina">
        <h1>📦 Meus <span>Pedidos</span></h1>
      </div>

      {pedidos.length === 0 ? (
        <div className="empty-state" style={{ padding: '5rem 2rem' }}>
          <div className="empty-icon">📦</div>
          <h4>Nenhum pedido ainda</h4>
          <p>Você ainda não realizou nenhuma compra.</p>
          <Link to="/" className="btn-destaque mt-3 d-inline-block">Ver Produtos</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pedidos.map(pedido => {
            const agora = Date.now()
            const horasDesde = (agora - new Date(pedido.createdAt).getTime()) / (1000 * 60 * 60)
            const podeCancelar = pedido.status !== 'cancelado' && pedido.status !== 'entregue' && horasDesde <= 24

            return (
              <div key={pedido.id} style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 16, overflow: 'hidden', opacity: pedido.status === 'cancelado' ? 0.7 : 1 }}>
                <div style={{ background: '#111827', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #1e2d45' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600 }}>Pedido #{pedido.id}</span>
                    <span style={{ fontSize: '0.8rem', color: '#4a5870' }}>{formatar.data(pedido.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <BadgeStatus status={pedido.status} />
                    <span style={{ fontSize: '0.8rem', color: '#4a5870' }}>
                      {ICONE_METODO[pedido.metodoPagamento] || '💳'} {NOME_METODO[pedido.metodoPagamento] || pedido.metodoPagamento}
                    </span>
                    <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.1rem', fontWeight: 700, color: '#00d4ff' }}>
                      {formatar.moeda(pedido.total)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1.25rem' }}>
                  {(pedido.orderItems || []).map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #1e2d45' }}>
                      <img src={item.product?.image || ''} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #1e2d45' }}
                        onError={e => { e.target.src = 'https://placehold.co/48x48/111827/00d4ff?text=P' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.product?.name || 'Produto'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4a5870' }}>{item.quantity}× {formatar.moeda(item.price)}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600 }}>{formatar.moeda(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                {podeCancelar && (
                  <div style={{ padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.05)', borderTop: '1px solid rgba(239,68,68,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#4a5870' }}>⏱ Cancelamento disponível por {Math.max(0, Math.round(24 - horasDesde))}h</span>
                    <button className="btn-perigo-suave" style={{ fontSize: '0.8rem' }} onClick={() => setIdCancelar(pedido.id)}>
                      Cancelar Pedido
                    </button>
                  </div>
                )}
                {!podeCancelar && pedido.status !== 'cancelado' && (
                  <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid #1e2d45', fontSize: '0.72rem', color: '#4a5870' }}>
                    Prazo de cancelamento encerrado
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal cancelamento */}
      {idCancelar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div style={{ background: 'var(--cor-fundo-cartao)', border: '1px solid var(--cor-borda)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400, margin: '0 1rem' }}>
            <h5 style={{ color: 'var(--cor-erro)', margin: '0 0 1rem' }}>Cancelar Pedido</h5>
            <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-secundario)' }}>
              Tem certeza que deseja cancelar o <strong style={{ color: 'var(--cor-texto-principal)' }}>Pedido #{idCancelar}</strong>?
              O estoque dos produtos será devolvido.
            </p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className="btn-fantasma" onClick={() => setIdCancelar(null)}>Voltar</button>
              <button style={{ background: 'var(--cor-erro)', color: '#fff', border: 'none', borderRadius: 'var(--raio-p)', padding: '0.4rem 1rem', cursor: 'pointer' }} onClick={cancelar}>
                Cancelar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
