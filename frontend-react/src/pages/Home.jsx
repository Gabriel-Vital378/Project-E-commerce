import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cliente, formatar } from '../api/cliente'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'

const CATEGORIAS = [
  { valor: 'all',     rotulo: 'Todos os Produtos', icone: '◈' },
  { valor: 'mouse',   rotulo: 'Mouses',            icone: '🖱' },
  { valor: 'teclado', rotulo: 'Teclados',          icone: '⌨' },
  { valor: 'headset', rotulo: 'Headsets & Áudio',  icone: '🎧' },
]

export function Home() {
  const [produtos, setProdutos] = useState([])
  const [paginacao, setPaginacao] = useState(null)
  const [categoria, setCategoria] = useState('all')
  const [carregando, setCarregando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [searchParams] = useSearchParams()
  const busca = searchParams.get('busca') || ''
  const navigate = useNavigate()
  const { adicionar } = useCart()
  const toast = useToast()

  const carregar = useCallback(async () => {
    setCarregando(true)
    let url = `/products?page=${pagina}&limit=12`
    if (categoria !== 'all') url += `&category=${categoria}`
    if (busca) url += `&search=${encodeURIComponent(busca)}`
    const res = await cliente.buscar(url)
    setCarregando(false)
    if (res.success) { setProdutos(res.data); setPaginacao(res.pagination) }
  }, [pagina, categoria, busca])

  useEffect(() => { carregar() }, [carregar])

  const selecionarCategoria = (val) => { setCategoria(val); setPagina(1) }

  const adicionarCarrinho = (e, produto) => {
    e.stopPropagation()
    adicionar(produto, 1)
    toast.sucesso(`"${produto.name}" adicionado ao carrinho!`)
  }

  const labelCategoria = CATEGORIAS.find(c => c.valor === categoria)?.rotulo || 'Produtos'

  return (
    <div className="home-layout">
      {/* ── Sidebar lateral ── */}
      <aside className="sidebar-categorias">
        <div className="sidebar-secao-titulo">CATEGORIAS</div>
        <ul className="sidebar-lista">
          {CATEGORIAS.map(c => (
            <li key={c.valor}
              className={`sidebar-item${categoria === c.valor ? ' ativa' : ''}`}
              onClick={() => selecionarCategoria(c.valor)}>
              <span className="sidebar-icone">{c.icone}</span>
              <span className="sidebar-rotulo">{c.rotulo}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-secao-titulo" style={{ marginTop: '2rem' }}>FILTROS</div>
        <ul className="sidebar-lista">
          <li className="sidebar-info">
            <span style={{ fontSize: '0.78rem', color: 'var(--cor-texto-suave)' }}>
              {busca ? `Buscando: "${busca}"` : `${produtos.length} produtos`}
            </span>
          </li>
        </ul>

        <div className="sidebar-destaque">
          <div className="sidebar-destaque-titulo">🚀 Frete Grátis</div>
          <div className="sidebar-destaque-desc">Em compras acima de R$ 299,00</div>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <main className="home-conteudo">
        {/* Abas mobile (visível apenas em telas pequenas) */}
        <div className="abas-filtro d-flex d-lg-none mb-3">
          {CATEGORIAS.map(c => (
            <button key={c.valor} className={`aba-filtro${categoria === c.valor ? ' ativa' : ''}`}
              onClick={() => selecionarCategoria(c.valor)}>
              {c.icone} {c.rotulo}
            </button>
          ))}
        </div>

        <div className="home-cabecalho">
          <div>
            <h1 className="home-titulo">{labelCategoria}</h1>
            {busca && (
              <p className="home-subtitulo">Resultados para "{busca}"</p>
            )}
          </div>
        </div>

        {carregando ? (
          <div className="loading-overlay"><div className="spinner" /><span>Carregando...</span></div>
        ) : produtos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h4>Nenhum produto encontrado</h4>
            <p>Tente outra categoria ou termo de busca.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-xl-3 g-3">
            {produtos.map(p => {
              const parcela = formatar.moeda(p.price / 12)
              return (
                <div key={p.id} className="col">
                  <div className="cartao-produto" onClick={() => navigate(`/produto?id=${p.id}`)}>
                    <div className="cartao-produto-img-wrapper">
                      <img src={p.image} alt={p.name} className="cartao-produto-imagem"
                        onError={e => { e.target.src = 'https://placehold.co/400x300/111827/00d4ff?text=Produto' }} />
                      {p.stock === 0 && (
                        <span className="badge-oferta" style={{ background: '#4a5870' }}>Esgotado</span>
                      )}
                      {p.stock > 0 && p.stock <= 5 && (
                        <span className="badge-oferta" style={{ background: '#f59e0b' }}>Últimas unidades</span>
                      )}
                    </div>
                    <div className="cartao-produto-corpo">
                      <span className="cartao-produto-categoria">{formatar.categoria(p.category)}</span>
                      <h3 className="cartao-produto-nome">{p.name}</h3>
                      <p className="cartao-produto-descricao">{p.description}</p>
                    </div>
                    <div className="cartao-produto-rodape">
                      <div className="bloco-preco">
                        <span className="preco-produto">{formatar.moeda(p.price)}</span>
                      </div>
                      <div className="preco-parcelamento">12x <strong>{parcela}</strong> sem juros</div>
                      <button
                        className="btn-add-carrinho"
                        disabled={p.stock === 0}
                        onClick={e => adicionarCarrinho(e, p)}>
                        {p.stock > 0 ? '+ Adicionar ao Carrinho' : 'Indisponível'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {paginacao && paginacao.totalPages > 1 && (
          <div className="d-flex justify-content-center gap-2 mt-4">
            {Array.from({ length: paginacao.totalPages }, (_, i) => i + 1).map(pg => (
              <button key={pg} className={pg === pagina ? 'btn-destaque' : 'btn-fantasma'}
                style={{ minWidth: 36, height: 36, padding: 0, fontFamily: 'var(--fonte-titulo)' }}
                onClick={() => { setPagina(pg); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                {pg}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
