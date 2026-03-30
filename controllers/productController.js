// controllers/productController.js
// Controller de produtos: recebe req/res e delega ao service

const ProductService = require("../services/productService");
const ResponseFactory = require("../config/responseFactory");

const ProductController = {
  /**
   * GET /api/products
   * Lista produtos com filtros opcionais: ?category=mouse&search=logitech&page=1&limit=12
   */
  async getAll(req, res) {
    try {
      const { products, total } = await ProductService.getAll(req.query);
      const { page = 1, limit = 12 } = req.query;

      return ResponseFactory.paginated(
        res,
        products,
        total,
        page,
        limit,
        "Produtos recuperados com sucesso"
      );
    } catch (error) {
      return ResponseFactory.serverError(res, error.message);
    }
  },

  /**
   * GET /api/products/:id
   * Retorna um produto pelo ID
   */
  async getById(req, res) {
    try {
      const product = await ProductService.getById(req.params.id);
      return ResponseFactory.success(res, product);
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return ResponseFactory.error(res, error.message, statusCode);
    }
  },

  /**
   * POST /api/products
   * Cria novo produto (apenas admin)
   */
  async create(req, res) {
    try {
      const product = await ProductService.create(req.body);
      return ResponseFactory.created(res, product, "Produto criado com sucesso!");
    } catch (error) {
      return ResponseFactory.error(res, error.message, error.statusCode || 400);
    }
  },

  /**
   * PUT /api/products/:id
   * Atualiza produto (apenas admin)
   */
  async update(req, res) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      return ResponseFactory.success(res, product, "Produto atualizado com sucesso!");
    } catch (error) {
      return ResponseFactory.error(res, error.message, error.statusCode || 400);
    }
  },

  /**
   * DELETE /api/products/:id
   * Remove produto (apenas admin)
   */
  async delete(req, res) {
    try {
      await ProductService.delete(req.params.id);
      return ResponseFactory.success(res, null, "Produto removido com sucesso!");
    } catch (error) {
      return ResponseFactory.error(res, error.message, error.statusCode || 400);
    }
  },
};

module.exports = ProductController;
