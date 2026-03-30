// repositories/productRepository.js
// Repository Pattern para acesso aos dados de produtos

const prisma = require("../config/database");

const ProductRepository = {
  /**
   * Lista todos os produtos com filtros opcionais
   * @param {object} filters - { category, search, page, limit }
   */
  async findAll({ category, search, page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;

    // Monta o filtro dinamicamente
    const where = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      // SQLite não suporta mode:"insensitive" — usamos contains simples
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Busca os produtos e a contagem total em paralelo (mais eficiente)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },

  /**
   * Busca um produto por ID
   */
  async findById(id) {
    return await prisma.product.findUnique({
      where: { id: Number(id) },
    });
  },

  /**
   * Cria um novo produto
   */
  async create(data) {
    return await prisma.product.create({ data });
  },

  /**
   * Atualiza um produto
   */
  async update(id, data) {
    return await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
  },

  /**
   * Remove um produto
   */
  async delete(id) {
    return await prisma.product.delete({
      where: { id: Number(id) },
    });
  },

  /**
   * Atualiza o estoque após compra
   */
  async decrementStock(id, quantity) {
    return await prisma.product.update({
      where: { id: Number(id) },
      data: {
        stock: { decrement: quantity },
      },
    });
  },
};

module.exports = ProductRepository;
