// tests/productService.test.js
const ProductService = require('../services/productService');

jest.mock('../repositories/productRepository');

const ProductRepository = require('../repositories/productRepository');

describe('ProductService', () => {
  describe('getById', () => {
    it('deve lançar erro 404 se produto não existir', async () => {
      ProductRepository.findById.mockResolvedValue(null);
      const err = await ProductService.getById(999).catch(e => e);
      expect(err.statusCode).toBe(404);
      expect(err.message).toMatch(/não encontrado/);
    });

    it('deve retornar o produto quando existir', async () => {
      const produto = { id: 1, name: 'Mouse Gamer', price: 200, category: 'mouse' };
      ProductRepository.findById.mockResolvedValue(produto);
      const result = await ProductService.getById(1);
      expect(result).toEqual(produto);
    });
  });

  describe('create', () => {
    it('deve lançar erro se campos obrigatórios estiverem ausentes', async () => {
      await expect(ProductService.create({ name: '', description: '', price: 10, category: '' }))
        .rejects.toThrow('obrigatórios');
    });

    it('deve lançar erro se categoria for inválida', async () => {
      await expect(ProductService.create({ name: 'x', description: 'desc', price: 10, category: 'celular' }))
        .rejects.toThrow('Categoria inválida');
    });

    it('deve lançar erro se preço for zero ou negativo', async () => {
      await expect(ProductService.create({ name: 'x', description: 'desc', price: -1, category: 'mouse' }))
        .rejects.toThrow('preço deve ser maior que zero');
    });

    it('deve criar produto com sucesso', async () => {
      const produto = { id: 1, name: 'Mouse X', description: 'desc', price: 150, category: 'mouse', stock: 5 };
      ProductRepository.create.mockResolvedValue(produto);

      const result = await ProductService.create({
        name: 'Mouse X', description: 'desc', price: 150, category: 'mouse', stock: 5,
      });

      expect(result.name).toBe('Mouse X');
      expect(ProductRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('deve lançar erro 404 ao atualizar produto inexistente', async () => {
      ProductRepository.findById.mockResolvedValue(null);
      const err = await ProductService.update(999, { price: 200 }).catch(e => e);
      expect(err.statusCode).toBe(404);
    });

    it('deve atualizar produto existente', async () => {
      ProductRepository.findById.mockResolvedValue({ id: 1, name: 'Mouse', price: 100 });
      ProductRepository.update.mockResolvedValue({ id: 1, name: 'Mouse', price: 200 });

      const result = await ProductService.update(1, { price: 200 });
      expect(result.price).toBe(200);
    });
  });

  describe('delete', () => {
    it('deve lançar erro 404 ao deletar produto inexistente', async () => {
      ProductRepository.findById.mockResolvedValue(null);
      const err = await ProductService.delete(999).catch(e => e);
      expect(err.statusCode).toBe(404);
    });

    it('deve deletar produto existente e retornar mensagem', async () => {
      ProductRepository.findById.mockResolvedValue({ id: 1, name: 'Mouse' });
      ProductRepository.delete.mockResolvedValue({ id: 1 });

      const result = await ProductService.delete(1);
      expect(result).toHaveProperty('message');
      expect(ProductRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
