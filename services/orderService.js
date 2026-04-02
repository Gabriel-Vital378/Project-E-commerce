/**
 * @file orderService.js
 * @description Serviço de pedidos — contém toda a lógica de negócio relacionada a pedidos.
 * Não conhece Express (req/res). Lança erros com statusCode para o controller tratar.
 */

const OrderRepository   = require("../repositories/orderRepository");
const ProductRepository = require("../repositories/productRepository");

const OrderService = {

  /**
   * Cria um novo pedido validando estoque e calculando o total.
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {Array<{productId: number, quantity: number}>} itensCarrinho - Itens do carrinho
   * @param {string} metodoPagamento - Forma de pagamento (ex: "cartao", "pix")
   * @returns {Promise<object>} Pedido criado
   */
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

  /**
   * Retorna todos os pedidos de um usuário específico.
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise<Array>} Lista de pedidos
   */
  async getUserOrders(usuarioId) {
    return await OrderRepository.findByUserId(usuarioId);
  },

  /**
   * Retorna todos os pedidos do sistema (uso exclusivo do admin).
   * @returns {Promise<Array>} Lista completa de pedidos
   */
  async getAllOrders() {
    return await OrderRepository.findAll();
  },

  /**
   * Retorna um pedido pelo ID, verificando permissão de acesso.
   * @param {number} id - ID do pedido
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {string} roleUsuario - Role do usuário ("admin" ou "client")
   * @returns {Promise<object>} Pedido encontrado
   */
  async getOrderById(id, usuarioId, roleUsuario) {
    const pedido = await OrderRepository.findById(id);
    if (!pedido) { const e = new Error("Pedido não encontrado."); e.statusCode = 404; throw e; }
    if (roleUsuario !== "admin" && pedido.userId !== Number(usuarioId)) {
      const e = new Error("Acesso negado."); e.statusCode = 403; throw e;
    }
    return pedido;
  },

  /**
   * Cancela um pedido aplicando as regras de negócio:
   * - Cliente só pode cancelar em até 24h após a compra
   * - Admin pode cancelar a qualquer momento
   * - Devolve o estoque dos produtos automaticamente
   * @param {number} id - ID do pedido
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {string} roleUsuario - Role do usuário ("admin" ou "client")
   * @returns {Promise<{mensagem: string}>}
   */
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
