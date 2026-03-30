// repositories/orderRepository.js
const prisma = require("../config/database");

const OrderRepository = {

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

  async findByUserId(usuarioId) {
    return await prisma.order.findMany({
      where: { userId: Number(usuarioId) },
      include: {
        orderItems: { include: { product: { select: { id: true, name: true, image: true, category: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id) {
    return await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

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
