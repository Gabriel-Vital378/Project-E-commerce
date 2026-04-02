/**
 * @file orderRepository.js
 * @description Repository Pattern — abstrai o acesso ao banco de dados para pedidos.
 * Usa transações do Prisma para garantir consistência ao criar e cancelar pedidos.
 */

const prisma = require("../config/database");

const OrderRepository = {

  /**
   * Cria um pedido com seus itens e decrementa o estoque dos produtos.
   * Utiliza transação para garantir atomicidade da operação.
   * @param {number} usuarioId - ID do usuário
   * @param {Array<{productId: number, quantity: number, price: number}>} itens
   * @param {number} total - Valor total do pedido
   * @param {string} metodoPagamento - Forma de pagamento
   * @returns {Promise<object>} Pedido criado
   */
  async create(usuarioId, itens, total, metodoPagamento) {
    return await prisma.$transaction(async (tx) => {
      const pedido = await tx.order.create({
        data: { userId: Number(usuarioId), total, status: "confirmado", metodoPagamento },
      });

      await tx.orderItem.createMany({
        data: itens.map((item) => ({
          orderId: pedido.id, productId: item.productId,
          quantity: item.quantity, price: item.price,
        })),
      });

      for (const item of itens) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        });
      }
      return pedido;
    });
  },

  /**
   * Cancela um pedido e devolve o estoque de todos os itens.
   * Utiliza transação para garantir consistência.
   * @param {number} id - ID do pedido
   * @returns {Promise<object>} Pedido atualizado
   */
  async cancelar(id) {
    return await prisma.$transaction(async (tx) => {
      const pedido = await tx.order.update({
        where: { id: Number(id) },
        data:  { status: "cancelado" },
        include: { orderItems: true },
      });

      // Devolve estoque
      for (const item of pedido.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { increment: item.quantity } },
        });
      }
      return pedido;
    });
  },

  /**
   * Retorna todos os pedidos de um usuário, com itens e produtos incluídos.
   * @param {number} usuarioId
   * @returns {Promise<Array>}
   */
  async findByUserId(usuarioId) {
    return await prisma.order.findMany({
      where: { userId: Number(usuarioId) },
      include: {
        orderItems: { include: { product: { select: { id: true, name: true, image: true, category: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Retorna um pedido pelo ID com itens, produtos e dados do usuário.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Retorna todos os pedidos do sistema (uso admin).
   * @returns {Promise<Array>}
   */
  async findAll() {
    return await prisma.order.findMany({
      include: {
        user:       { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: { select: { id: true, name: true, price: true, image: true, category: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};

module.exports = OrderRepository;
