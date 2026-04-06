/**
 * @file productRepository.js
 * @description Repositório de acesso aos dados de produtos.
 *
 * @pattern Repository (Estrutural)
 * @problem Os services precisavam acessar o banco diretamente via Prisma,
 *          criando alto acoplamento. Qualquer mudança no ORM exigiria
 *          alterar todos os services.
 * @solution O Repository abstrai o acesso ao banco em métodos bem definidos.
 *           Os services chamam apenas o repository, sem conhecer o Prisma.
 * @benefit  Trocar o banco de SQLite para PostgreSQL exige alterar apenas
 *           os repositories — sem tocar na lógica de negócio dos services.
 *
 * @principle SOLID — Dependency Inversion (D)
 * @description Os services dependem da abstração (ProductRepository),
 *              não da implementação concreta (prisma.product.*).
 */
 
const prisma = require("../config/database");
 
const ProductRepository = {
 
  /**
   * Lista produtos com filtros opcionais e paginação.
   * @param {object} opcoes           - Opções de filtro e paginação
   * @param {string} opcoes.category  - Filtrar por categoria (mouse, teclado, headset)
   * @param {string} opcoes.search    - Buscar por nome ou descrição
   * @param {number} opcoes.page      - Página atual (padrão: 1)
   * @param {number} opcoes.limit     - Itens por página (padrão: 12)
   * @returns {Promise<{products: Array, total: number}>}
   */
  async findAll({ category, search, page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;
    const where = {};
 
    if (category && category !== "all") {
      where.category = category;
    }
 
    if (search) {
      // SQLite não suporta mode: "insensitive" — usamos contains simples
      where.OR = [
        { name:        { contains: search } },
        { description: { contains: search } },
      ];
    }
 
    // Executa as duas queries em paralelo para melhor performance
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take:    Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);
 
    return { products, total };
  },
 
  /**
   * Busca um produto pelo ID.
   * @param {number} id - ID do produto
   * @returns {Promise<object|null>} Produto encontrado ou null
   */
  async findById(id) {
    return await prisma.product.findUnique({
      where: { id: Number(id) },
    });
  },
 
  /**
   * Cria um novo produto no banco.
   * @param {object} data - Dados do produto
   * @returns {Promise<object>} Produto criado
   */
  async create(data) {
    return await prisma.product.create({ data });
  },
 
  /**
   * Atualiza os dados de um produto.
   * @param {number} id   - ID do produto
   * @param {object} data - Campos a atualizar
   * @returns {Promise<object>} Produto atualizado
   */
  async update(id, data) {
    return await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
  },
 
  /**
   * Remove um produto do banco.
   * @param {number} id - ID do produto
   * @returns {Promise<object>} Produto removido
   */
  async delete(id) {
    return await prisma.product.delete({
      where: { id: Number(id) },
    });
  },
};
 
module.exports = ProductRepository;
