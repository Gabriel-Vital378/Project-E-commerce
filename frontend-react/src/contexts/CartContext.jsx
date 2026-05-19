import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

const lerCarrinho = () => {
  try { return JSON.parse(localStorage.getItem('carrinho') || '[]') } catch { return [] }
}

export function CartProvider({ children }) {
  const [itens, setItens] = useState(lerCarrinho)

  const salvar = (novos) => {
    localStorage.setItem('carrinho', JSON.stringify(novos))
    setItens(novos)
  }

  const adicionar = (produto, quantidade = 1) => {
    const atual = lerCarrinho()
    const existe = atual.find(i => i.id === produto.id)
    if (existe) {
      existe.quantidade = Math.min(existe.quantidade + quantidade, produto.stock)
    } else {
      atual.push({ id: produto.id, nome: produto.name, preco: produto.price, imagem: produto.image, categoria: produto.category, estoque: produto.stock, quantidade })
    }
    salvar(atual)
  }

  const remover = (id) => salvar(lerCarrinho().filter(i => i.id !== id))

  const alterarQuantidade = (id, qtd) => {
    if (qtd <= 0) { remover(id); return }
    const atual = lerCarrinho()
    const item = atual.find(i => i.id === id)
    if (item) { item.quantidade = Math.min(qtd, item.estoque); salvar(atual) }
  }

  const limpar = () => salvar([])

  return (
    <CartContext.Provider value={{
      itens,
      adicionar,
      remover,
      alterarQuantidade,
      limpar,
      total:      itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
      quantidade: itens.reduce((s, i) => s + i.quantidade, 0),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
