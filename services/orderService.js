// services/orderService.js
const OrderRepository   = require("../repositories/orderRepository");
const ProductRepository = require("../repositories/productRepository");

const OrderService = {

  async createOrder(usuarioId, itensCarrinho, metodoPagamento) {
    if (!itensCarrinho || itensCarrinho.length === 0)
      throw new Error("O carrinho está vazio.");

    const itensPedido = [];
    let total = 0;

    for (const item of itensCarrinho) {
      const produto = await ProductRepository.findById(item.productId);
      if (!produto) throw new Error(`Produto ID ${item.productId} não encontrado.`);
      if (produto.stock < item.quantity)
        throw new Error(`Estoque insuficiente para "${produto.name}". Disponível: ${produto.stock}`);

      itensPedido.push({ productId: produto.id, quantity: item.quantity, price: produto.price });
      total += produto.price * item.quantity;
    }

    return await OrderRepository.create(usuarioId, itensPedido, total, metodoPagamento || "cartao");
  },

  async getUserOrders(usuarioId) {
    return await OrderRepository.findByUserId(usuarioId);
  },

  async getAllOrders() {
    return await OrderRepository.findAll();
  },

  async getOrderById(id, usuarioId, roleUsuario) {
    const pedido = await OrderRepository.findById(id);
    if (!pedido) { const e = new Error("Pedido não encontrado."); e.statusCode = 404; throw e; }
    if (roleUsuario !== "admin" && pedido.userId !== Number(usuarioId)) {
      const e = new Error("Acesso negado."); e.statusCode = 403; throw e;
    }
    return pedido;
  },

  async cancelarPedido(id, usuarioId, roleUsuario) {
    const pedido = await OrderRepository.findById(id);
    if (!pedido) { const e = new Error("Pedido não encontrado."); e.statusCode = 404; throw e; }

    // Só dono ou admin pode cancelar
    if (roleUsuario !== "admin" && pedido.userId !== Number(usuarioId)) {
      const e = new Error("Acesso negado."); e.statusCode = 403; throw e;
    }

    // Verifica se já cancelado ou entregue
    if (pedido.status === "cancelado")
      throw new Error("Este pedido já foi cancelado.");
    if (pedido.status === "entregue")
      throw new Error("Pedidos já entregues não podem ser cancelados.");

    // Regra das 24h para clientes (admin pode cancelar qualquer hora)
    if (roleUsuario !== "admin") {
      const horasDesde = (Date.now() - new Date(pedido.createdAt).getTime()) / (1000 * 60 * 60);
      if (horasDesde > 24)
        throw new Error("O prazo para cancelamento é de 24 horas após a compra.");
    }

    // Devolve estoque
    await OrderRepository.cancelar(id);
    return { mensagem: "Pedido cancelado com sucesso." };
  },
};

module.exports = OrderService;
