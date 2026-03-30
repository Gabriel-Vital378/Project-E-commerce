// services/productService.js
// Lógica de negócio dos produtos

const ProductRepository = require("../repositories/productRepository");

const ProductService = {
  /**
   * Lista produtos com filtros e paginação
   */
  async getAll(query) {
    const { category, search, page = 1, limit = 12 } = query;
    return await ProductRepository.findAll({ category, search, page, limit });
  },

  /**
   * Busca produto por ID
   */
  async getById(id) {
    const product = await ProductRepository.findById(id);
    if (!product) {
      const err = new Error("Produto não encontrado");
      err.statusCode = 404;
      throw err;
    }
    return product;
  },

  /**
   * Cria novo produto (admin)
   */
  async create(data) {
    const { name, description, price, category, image, stock } = data;

    // Validações
    if (!name || !description || !price || !category) {
      throw new Error("Nome, descrição, preço e categoria são obrigatórios");
    }

    const validCategories = ["mouse", "teclado", "headset"];
    if (!validCategories.includes(category)) {
      throw new Error(`Categoria inválida. Use: ${validCategories.join(", ")}`);
    }

    if (price <= 0) {
      throw new Error("O preço deve ser maior que zero");
    }

    return await ProductRepository.create({
      name,
      description,
      price: Number(price),
      category,
      image: image || "https://via.placeholder.com/400x300?text=Produto",
      stock: Number(stock) || 0,
    });
  },

  /**
   * Atualiza produto (admin)
   */
  async update(id, data) {
    // Verifica se existe
    await this.getById(id);

    // Filtra apenas campos permitidos para update
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.stock !== undefined) updateData.stock = Number(data.stock);

    return await ProductRepository.update(id, updateData);
  },

  /**
   * Remove produto (admin)
   */
  async delete(id) {
    await this.getById(id); // Verifica se existe antes de deletar
    await ProductRepository.delete(id);
    return { message: "Produto removido com sucesso" };
  },
};

module.exports = ProductService;
