import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cliente, formatar } from '../api/cliente'
import { useCart } from '../contexts/CartContext'

function gerarUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export function Checkout() {
  const { itens, total: subtotal, limpar } = useCart()
  const navigate = useNavigate()
  const [metodo, setMetodo] = useState('cartao')
  const [numCartao, setNumCartao] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [parcelas, setParcelas] = useState(1)
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const contadorRef = useRef(null)
  const [tempoRestante, setTempoRestante] = useState(14 * 60 + 59)

  const frete = subtotal >= 299 ? 0 : 29.9
  const total = subtotal + frete

  useEffect(() => {
    if (!itens.length) navigate('/carrinho', { replace: true })
  }, [itens])

  useEffect(() => {
    if (metodo === 'pix') {
      setTempoRestante(14 * 60 + 59)
      contadorRef.current = setInterval(() => {
        setTempoRestante(t => { if (t <= 1) { clearInterval(contadorRef.current); return 0 } return t - 1 })
      }, 1000)
    }
    return () => clearInterval(contadorRef.current)
  }, [metodo])

  const formatarCartao = (v) => {
    const num = v.replace(/\D/g, '').substring(0, 16)
    return num.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatarValidade = (v) => {
    const num = v.replace(/\D/g, '').substring(0, 4)
    return num.length > 2 ? `${num.substring(0, 2)}/${num.substring(2)}` : num
  }

  const numExibir = () => {
    const num = numCartao.replace(/\s/g, '').padEnd(16, '•')
    return [0,4,8,12].map(i => num.substring(i, i + 4)).join(' ')
  }

  const finalizar = async () => {
    setErro('')
    if (metodo === 'cartao') {
      if (numCartao.replace(/\s/g, '').length < 16) { setErro('Digite o número completo do cartão.'); return }
      if (!nomeCartao.trim()) { setErro('Digite o nome do titular.'); return }
      if (validade.length < 5) { setErro('Digite a validade do cartão.'); return }
      if (cvv.length < 3) { setErro('Digite o CVV.'); return }
    }

    setProcessando(true)
    await new Promise(r => setTimeout(r, 2000))

    const itensEnvio = itens.map(i => ({ productId: i.id, quantity: i.quantidade }))
    const res = await cliente.enviar('/orders', { items: itensEnvio, metodoPagamento: metodo })
    setProcessando(false)

    if (res.success) {
      limpar()
      setSucesso(true)
    } else {
      setErro(res.message || 'Erro ao finalizar pedido.')
    }
  }

  const qrCells = () => {
    let seed = 42
    const cells = []
    for (let i = 0; i < 225; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const row = Math.floor(i / 15), col = i % 15
      const borda = (row < 2 || row > 12 || col < 2 || col > 12) && (row < 7 || col < 7)
      cells.push(borda || seed % 3 === 0)
    }
    return cells
  }

  const min = String(Math.floor(tempoRestante / 60)).padStart(2, '0')
  const seg = String(tempoRestante % 60).padStart(2, '0')

  if (sucesso) return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem', animation: 'pulsar 0.5s ease' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '2rem', marginBottom: '0.5rem' }}>Pedido Confirmado!</h2>
        <p style={{ color: '#8a9bbf', marginBottom: '0.5rem' }}>Seu pedido foi realizado com sucesso.</p>
        <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '2rem' }}>
          {metodo === 'cartao' ? '✅ Pagamento no cartão aprovado!' : metodo === 'pix' ? '✅ PIX confirmado!' : '📄 Boleto gerado!'}
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/pedidos" className="btn-destaque">Ver Meus Pedidos</Link>
          <Link to="/" className="btn-fantasma">Continuar Comprando</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      {/* Passos */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        {['Carrinho', 'Pagamento', 'Confirmação'].map((p, i) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? '1' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--fonte-titulo)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: i === 0 ? '#10b981' : i === 1 ? '#00d4ff' : '#4a5870' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#10b981' : i === 1 ? '#00d4ff' : '#1e2d45', color: i < 2 ? '#000' : '#8a9bbf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                {i === 0 ? '✓' : i + 1}
              </div>
              {p}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: '#1e2d45', margin: '0 8px' }} />}
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Formulário */}
        <div className="col-lg-7">
          <div style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '1.5rem' }}>
            <h5 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.1rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1e2d45' }}>
              💳 Escolha a forma de pagamento
            </h5>

            <div className="row g-2 mb-4">
              {[['cartao','💳','Cartão'],['pix','📱','PIX'],['boleto','🔖','Boleto']].map(([m, ic, label]) => (
                <div key={m} className="col-4">
                  <div onClick={() => setMetodo(m)} style={{ background: metodo === m ? 'rgba(0,212,255,0.12)' : '#151d2e', border: `2px solid ${metodo === m ? '#00d4ff' : '#1e2d45'}`, borderRadius: 12, padding: '1.1rem', cursor: 'pointer', textAlign: 'center', color: metodo === m ? '#00d4ff' : '#8a9bbf', fontFamily: 'var(--fonte-titulo)', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: 6 }}>{ic}</span>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {metodo === 'cartao' && (
              <>
                <div style={{ background: 'linear-gradient(135deg,#1a2540,#0d1525)', border: '1px solid #1e2d45', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', minHeight: 160 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1rem', fontWeight: 700, color: '#00d4ff', letterSpacing: '0.05em' }}>ZYRON.shop</span>
                    <span style={{ fontSize: '1.8rem' }}>💳</span>
                  </div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: '1.3rem', letterSpacing: '0.2em', color: '#e8edf5', margin: '0.75rem 0' }}>{numExibir()}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.85rem', color: '#8a9bbf', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{nomeCartao || 'NOME NO CARTÃO'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a9bbf' }}>{validade || 'MM/AA'}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Número do cartão</label>
                  <input type="text" className="form-control" placeholder="0000 0000 0000 0000" maxLength={19}
                    value={numCartao} onChange={e => setNumCartao(formatarCartao(e.target.value))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nome no cartão</label>
                  <input type="text" className="form-control" placeholder="NOME COMPLETO" style={{ textTransform: 'uppercase' }}
                    value={nomeCartao} onChange={e => setNomeCartao(e.target.value.toUpperCase())} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Validade</label>
                    <input type="text" className="form-control" placeholder="MM/AA" maxLength={5}
                      value={validade} onChange={e => setValidade(formatarValidade(e.target.value))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">CVV</label>
                    <input type="text" className="form-control" placeholder="•••" maxLength={3}
                      value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Parcelas</label>
                  <select className="form-select" value={parcelas} onChange={e => setParcelas(Number(e.target.value))}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}x de {formatar.moeda(total / n)}{n <= 6 ? ' (sem juros)' : ' (com juros)'}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {metodo === 'pix' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#8a9bbf', fontSize: '0.875rem', marginBottom: '1rem' }}>Escaneie o QR Code com o app do seu banco</p>
                <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', display: 'inline-block', margin: '0 auto 1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 12px)', gridTemplateRows: 'repeat(15, 12px)', gap: 1 }}>
                    {qrCells().map((preto, i) => (
                      <div key={i} style={{ borderRadius: 1, background: preto ? '#000' : '#fff' }} />
                    ))}
                  </div>
                </div>
                <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#4a5870', marginBottom: 4 }}>Chave PIX copia e cola</div>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: '0.75rem', color: '#00d4ff', wordBreak: 'break-all' }}>
                    00020126580014br.gov.bcb.pix0136{gerarUUID()}5204000053039865802BR
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: '0.8rem', color: '#10b981' }}>
                  <span>⏱</span><span>QR Code válido por <strong>{min}:{seg}</strong></span>
                </div>
              </div>
            )}

            {metodo === 'boleto' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#8a9bbf', fontSize: '0.875rem', marginBottom: '1rem' }}>Pague em qualquer banco, casa lotérica ou pelo app</p>
                <div style={{ display: 'flex', gap: 2, height: 60, alignItems: 'stretch', justifyContent: 'center', margin: '1rem 0' }}>
                  {Array.from({ length: 80 }, (_, i) => (
                    <div key={i} style={{ background: '#111', borderRadius: 1, width: i % 3 === 0 ? 3 : 1.5, height: i % 5 === 0 ? 55 : 40 }} />
                  ))}
                </div>
                <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, padding: '0.75rem', margin: '0.75rem 0', fontFamily: "'Courier New',monospace", fontSize: '0.72rem', color: '#e8edf5', wordBreak: 'break-all' }}>
                  {Array.from({ length: 47 }, (_, i) => [9,19,30].includes(i) ? ' ' + Math.floor(Math.random()*10) : Math.floor(Math.random()*10)).join('')}
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', color: '#f59e0b' }}>
                  ⚠ Vencimento em <strong>{new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('pt-BR')}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="col-lg-5">
          <div style={{ background: '#151d2e', border: '1px solid #1e2d45', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
            <h5 style={{ fontFamily: 'var(--fonte-titulo)', fontSize: '1.1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1e2d45' }}>🛍 Resumo do Pedido</h5>
            {itens.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.65rem' }}>
                <img src={item.imagem} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid #1e2d45' }}
                  onError={e => { e.target.src = 'https://placehold.co/44x44/111827/00d4ff?text=P' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{item.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5870' }}>× {item.quantidade}</div>
                </div>
                <div style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600, color: '#00d4ff' }}>{formatar.moeda(item.preco * item.quantidade)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1e2d45', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#8a9bbf', marginBottom: '0.4rem' }}>
                <span>Subtotal</span><span>{formatar.moeda(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#8a9bbf', marginBottom: '0.75rem' }}>
                <span>Frete</span><span style={{ color: frete === 0 ? '#10b981' : 'inherit' }}>{frete === 0 ? 'Grátis 🎉' : formatar.moeda(frete)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--fonte-titulo)', fontSize: '1.4rem', fontWeight: 700 }}>
                <span>Total</span><span style={{ color: '#00d4ff' }}>{formatar.moeda(total)}</span>
              </div>
            </div>

            {erro && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#f87171', fontSize: '0.875rem', margin: '1rem 0' }}>{erro}</div>}

            <button onClick={finalizar} disabled={processando}
              style={{ width: '100%', marginTop: '1.25rem', background: '#00d4ff', color: '#000', border: 'none', borderRadius: 8, padding: '0.85rem', fontFamily: 'var(--fonte-titulo)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.05em', cursor: processando ? 'not-allowed' : 'pointer', opacity: processando ? 0.7 : 1 }}>
              {processando ? 'Processando...' : '🔒 CONFIRMAR PAGAMENTO'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#4a5870' }}>
              🔒 Ambiente 100% simulado — nenhum dado real é processado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
