import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { formatar } from '../api/cliente'

export function Cart() {
  const { itens, remover, alterarQuantidade, limpar, total: subtotal } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  const frete = subtotal >= 299 ? 0 : 29.9
  const total = subtotal + frete

  if (itens.length === 0) return (
    <div className="container py-4">
      <div className="cabecalho-pagina">
        <h1>🛒 Meu <span>Carrinho</span></h1>
      </div>
      <div className="empty-state" style={{ padding: '5rem 2rem' }}>
        <div className="empty-icon">🛒</div>
        <h4>Seu carrinho está vazio</h4>
        <p>Adicione produtos para continuar.</p>
        <Link to="/" className="btn-destaque mt-3 d-inline-block">Ver Produtos</Link>
      </div>
    </div>
  )

  const confirmarLimpar = () => {
    if (window.confirm('Limpar carrinho?')) { limpar(); toast.info('Carrinho limpo.') }
  }

  return (
    <div className="container py-4">
      <div className="cabecalho-pagina">
        <h1>🛒 Meu <span>Carrinho</span></h1>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="titulo-secao">Itens ({itens.length})</div>
          <div className="d-flex flex-column gap-2">
            {itens.map(item => (
              <div key={item.id} className="item-carrinho">
                <img src={item.imagem} className="item-carrinho-imagem" alt={item.nome}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/produto?id=${item.id}`)}
                  onError={e => { e.target.src = 'https://placehold.co/70x70/111827/00d4ff?text=P' }} />
                <div style={{ flex: 1 }}>
                  <div className="item-carrinho-nome">{item.nome}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-suave)', marginBottom: 4 }}>
                    {formatar.categoria(item.categoria)}
                  </div>
                  <div className="item-carrinho-preco">{formatar.moeda(item.preco)}</div>
                </div>
                <div className="controle-quantidade">
                  <button className="btn-quantidade" onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}>−</button>
                  <span className="valor-quantidade">{item.quantidade}</span>
                  <button className="btn-quantidade" onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>+</button>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontFamily: 'var(--fonte-titulo)', fontWeight: 600, marginBottom: 6 }}>
                    {formatar.moeda(item.preco * item.quantidade)}
                  </div>
                  <button className="btn-perigo-suave" onClick={() => { remover(item.id); toast.info('Item removido.') }}>
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <Link to="/" className="btn-fantasma">← Continuar comprando</Link>
            <button className="btn-perigo-suave" onClick={confirmarLimpar}>🗑 Limpar carrinho</button>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="cartao-resumo">
            <h5>Resumo do Pedido</h5>
            <div className="linha-resumo"><span>Subtotal</span><span>{formatar.moeda(subtotal)}</span></div>
            <div className="linha-resumo">
              <span>Frete</span>
              <span style={{ color: frete === 0 ? 'var(--cor-sucesso)' : 'inherit' }}>
                {frete === 0 ? 'Grátis 🎉' : formatar.moeda(frete)}
              </span>
            </div>
            {frete > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--cor-texto-suave)', marginBottom: '0.5rem' }}>
                Frete grátis acima de {formatar.moeda(299)}
              </div>
            )}
            <div className="total-resumo"><span>Total</span><span>{formatar.moeda(total)}</span></div>
            <button className="btn-destaque w-100 mt-4 py-2" style={{ fontSize: '1rem' }}
              onClick={() => navigate('/pagamento')}>
              Ir para Pagamento →
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--cor-texto-suave)', marginTop: '0.75rem' }}>
              🔒 Checkout 100% seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
