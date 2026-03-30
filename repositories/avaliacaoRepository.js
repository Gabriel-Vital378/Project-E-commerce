// repositories/avaliacaoRepository.js
const prisma = require("../config/database");

const AvaliacaoRepository = {

  // Busca todas as avaliações de um produto
  async buscarPorProduto(produtoId) {
    return await prisma.avaliacao.findMany({
      where: { produtoId: Number(produtoId) },
      orderBy: { createdAt: "desc" },
    });
  },

  // Cria nova avaliação
  async criar(dados) {
    return await prisma.avaliacao.create({ data: dados });
  },

  // Verifica se usuário já avaliou este produto
  async jaAvaliou(produtoId, usuarioId) {
    const existente = await prisma.avaliacao.findFirst({
      where: {
        produtoId:  Number(produtoId),
        usuarioId:  Number(usuarioId),
        ficticia:   false,
      },
    });
    return !!existente;
  },

  // Verifica se usuário comprou o produto (para liberar avaliação)
  async usuarioComprouProduto(usuarioId, produtoId) {
    const item = await prisma.orderItem.findFirst({
      where: {
        productId: Number(produtoId),
        order: {
          userId: Number(usuarioId),
          status: { not: "cancelado" },
        },
      },
    });
    return !!item;
  },
};

module.exports = AvaliacaoRepository;
