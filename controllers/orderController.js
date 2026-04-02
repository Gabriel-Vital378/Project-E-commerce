/**
 * @file orderController.js
 * @description Controller de pedidos — recebe req/res e delega ao OrderService.
 * Camada responsável apenas por extrair dados da requisição e formatar a resposta HTTP.
 */

const OrderService    = require("../services/orderService");
const ResponseFactory = require("../config/responseFactory");

const OrderController = {

  /**
   * POST /api/orders
   * Cria um novo pedido para o usuário autenticado.
   * @param {import('express').Request} req - Deve conter req.user.id, req.body.items e req.body.metodoPagamento
   * @param {import('express').Response} res
   */
  async create(req, res) {
    try {
      const { items, metodoPagamento } = req.body;
      const pedido = await OrderService.createOrder(req.user.id, items, metodoPagamento);
      return ResponseFactory.created(res, pedido, "Pedido realizado com sucesso! 🎉");
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },

  /**
   * GET /api/orders/my
   * Retorna todos os pedidos do usuário autenticado.
   * @param {import('express').Request} req - Deve conter req.user.id
   * @param {import('express').Response} res
   */
  async getMyOrders(req, res) {
    try {
      const pedidos = await OrderService.getUserOrders(req.user.id);
      return ResponseFactory.success(res, pedidos);
    } catch (erro) {
      return ResponseFactory.serverError(res);
    }
  },

  /**
   * GET /api/orders
   * Retorna todos os pedidos do sistema (apenas admin).
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async getAll(req, res) {
    try {
      const pedidos = await OrderService.getAllOrders();
      return ResponseFactory.success(res, pedidos);
    } catch (erro) {
      return ResponseFactory.serverError(res);
    }
  },

  /**
   * GET /api/orders/:id
   * Retorna detalhes de um pedido. Cliente só acessa os próprios; admin acessa todos.
   * @param {import('express').Request} req - req.params.id, req.user.id, req.user.role
   * @param {import('express').Response} res
   */
  async getById(req, res) {
    try {
      const pedido = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
      return ResponseFactory.success(res, pedido);
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },

  /**
   * PATCH /api/orders/:id/cancelar
   * Cancela um pedido. Cliente tem prazo de 24h; admin pode cancelar a qualquer momento.
   * @param {import('express').Request} req - req.params.id, req.user.id, req.user.role
   * @param {import('express').Response} res
   */
  async cancelar(req, res) {
    try {
      const resultado = await OrderService.cancelarPedido(req.params.id, req.user.id, req.user.role);
      return ResponseFactory.success(res, resultado, resultado.mensagem);
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },
};

module.exports = OrderController;
