// controllers/orderController.js
const OrderService    = require("../services/orderService");
const ResponseFactory = require("../config/responseFactory");

const OrderController = {

  async create(req, res) {
    try {
      const { items, metodoPagamento } = req.body;
      const pedido = await OrderService.createOrder(req.user.id, items, metodoPagamento);
      return ResponseFactory.created(res, pedido, "Pedido realizado com sucesso! 🎉");
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },

  async getMyOrders(req, res) {
    try {
      const pedidos = await OrderService.getUserOrders(req.user.id);
      return ResponseFactory.success(res, pedidos);
    } catch (erro) {
      return ResponseFactory.serverError(res);
    }
  },

  async getAll(req, res) {
    try {
      const pedidos = await OrderService.getAllOrders();
      return ResponseFactory.success(res, pedidos);
    } catch (erro) {
      return ResponseFactory.serverError(res);
    }
  },

  async getById(req, res) {
    try {
      const pedido = await OrderService.getOrderById(req.params.id, req.user.id, req.user.role);
      return ResponseFactory.success(res, pedido);
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },

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
