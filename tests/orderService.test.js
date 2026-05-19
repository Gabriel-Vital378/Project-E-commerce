// tests/orderService.test.js
const OrderService = require('../services/orderService');

jest.mock('../repositories/orderRepository');
jest.mock('../repositories/productRepository');
// Mock do producer para os testes não dependerem do Kafka
jest.mock('../src/producer/pedidoProducer', () => ({ publicarPedido: jest.fn().mockResolvedValue() }));

const OrderRepository = require('../repositories/orderRepository');
const ProductRepository = require('../repositories/productRepository');

describe('OrderService', () => {
  describe('createOrder', () => {
    it('deve lançar erro se o carrinho estiver vazio', async () => {
      await expect(OrderService.createOrder(1, [], 'pix'))
        .rejects.toThrow('O carrinho está vazio.');
    });

    it('deve lançar erro se produto não for encontrado', async () => {
      ProductRepository.findById.mockResolvedValue(null);
      await expect(OrderService.createOrder(1, [{ productId: 99, quantity: 1 }], 'pix'))
        .rejects.toThrow('não encontrado');
    });

    it('deve lançar erro se estoque for insuficiente', async () => {
      ProductRepository.findById.mockResolvedValue({ id: 1, name: 'Mouse', price: 100, stock: 2 });
      await expect(OrderService.createOrder(1, [{ productId: 1, quantity: 5 }], 'pix'))
        .rejects.toThrow('Estoque insuficiente');
    });

    it('deve criar pedido com sucesso e retornar o pedido criado', async () => {
      ProductRepository.findById.mockResolvedValue({ id: 1, name: 'Mouse Gamer', price: 250, stock: 10 });
      OrderRepository.create.mockResolvedValue({ id: 42, userId: 1, status: 'confirmado', total: 250 });

      const result = await OrderService.createOrder(1, [{ productId: 1, quantity: 1 }], 'pix');

      expect(result.id).toBe(42);
      expect(result.status).toBe('confirmado');
      expect(OrderRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve calcular o total corretamente para múltiplos itens', async () => {
      ProductRepository.findById
        .mockResolvedValueOnce({ id: 1, name: 'Mouse', price: 100, stock: 10 })
        .mockResolvedValueOnce({ id: 2, name: 'Teclado', price: 300, stock: 5 });
      OrderRepository.create.mockResolvedValue({ id: 1, userId: 1, status: 'confirmado', total: 700 });

      await OrderService.createOrder(1, [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ], 'cartao');

      // total = (100 * 2) + (300 * 1) = 500
      expect(OrderRepository.create).toHaveBeenCalledWith(1, expect.any(Array), 500, 'cartao');
    });
  });

  describe('cancelarPedido', () => {
    it('deve lançar erro 404 se pedido não existir', async () => {
      OrderRepository.findById.mockResolvedValue(null);
      const err = await OrderService.cancelarPedido(99, 1, 'client').catch(e => e);
      expect(err.statusCode).toBe(404);
    });

    it('deve lançar erro 403 se cliente tentar cancelar pedido de outro usuário', async () => {
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 99, status: 'confirmado', createdAt: new Date() });
      const err = await OrderService.cancelarPedido(1, 1, 'client').catch(e => e);
      expect(err.statusCode).toBe(403);
    });

    it('deve lançar erro se pedido já estiver cancelado', async () => {
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 1, status: 'cancelado', createdAt: new Date() });
      await expect(OrderService.cancelarPedido(1, 1, 'client'))
        .rejects.toThrow('já foi cancelado');
    });

    it('deve lançar erro se pedido já tiver sido entregue', async () => {
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 1, status: 'entregue', createdAt: new Date() });
      await expect(OrderService.cancelarPedido(1, 1, 'client'))
        .rejects.toThrow('não podem ser cancelados');
    });

    it('admin deve cancelar pedido de qualquer usuário e a qualquer momento', async () => {
      const dataAntiga = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h atrás
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 99, status: 'confirmado', createdAt: dataAntiga });
      OrderRepository.cancelar.mockResolvedValue({ id: 1, status: 'cancelado' });

      const result = await OrderService.cancelarPedido(1, 1, 'admin');
      expect(result.mensagem).toBeDefined();
    });

    it('cliente não pode cancelar pedido após 24 horas', async () => {
      const dataAntiga = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25h atrás
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 1, status: 'confirmado', createdAt: dataAntiga });

      await expect(OrderService.cancelarPedido(1, 1, 'client'))
        .rejects.toThrow('24 horas');
    });
  });

  describe('getOrderById', () => {
    it('deve lançar erro 404 se pedido não existir', async () => {
      OrderRepository.findById.mockResolvedValue(null);
      const err = await OrderService.getOrderById(99, 1, 'client').catch(e => e);
      expect(err.statusCode).toBe(404);
    });

    it('deve lançar erro 403 se cliente tentar acessar pedido de outro usuário', async () => {
      OrderRepository.findById.mockResolvedValue({ id: 1, userId: 99 });
      const err = await OrderService.getOrderById(1, 1, 'client').catch(e => e);
      expect(err.statusCode).toBe(403);
    });

    it('admin pode acessar qualquer pedido', async () => {
      const pedido = { id: 1, userId: 99, status: 'confirmado' };
      OrderRepository.findById.mockResolvedValue(pedido);
      const result = await OrderService.getOrderById(1, 1, 'admin');
      expect(result).toEqual(pedido);
    });
  });
});
