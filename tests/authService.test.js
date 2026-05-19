// tests/authService.test.js
const AuthService = require('../services/authService');

jest.mock('../repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const UserRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register', () => {
    it('deve lançar erro se campos obrigatórios estiverem ausentes', async () => {
      await expect(AuthService.register({ name: '', email: '', password: '' }))
        .rejects.toThrow('Nome, email e senha são obrigatórios.');
    });

    it('deve lançar erro se senha tiver menos de 6 caracteres', async () => {
      await expect(AuthService.register({ name: 'Teste', email: 'a@b.com', password: '123' }))
        .rejects.toThrow('A senha deve ter pelo menos 6 caracteres.');
    });

    it('deve lançar erro 409 se email já estiver cadastrado', async () => {
      UserRepository.emailExists.mockResolvedValue(true);
      const err = await AuthService.register({ name: 'Teste', email: 'a@b.com', password: '123456' }).catch(e => e);
      expect(err.statusCode).toBe(409);
      expect(err.message).toMatch(/já está cadastrado/);
    });

    it('deve registrar usuário com sucesso e retornar token', async () => {
      UserRepository.emailExists.mockResolvedValue(false);
      bcrypt.hash.mockResolvedValue('senha_hash');
      UserRepository.create.mockResolvedValue({ id: 1, name: 'Teste', email: 'a@b.com', role: 'client' });
      jwt.sign.mockReturnValue('jwt_token_123');

      const result = await AuthService.register({ name: 'Teste', email: 'a@b.com', password: '123456' });

      expect(result).toHaveProperty('token', 'jwt_token_123');
      expect(result.user.email).toBe('a@b.com');
      expect(UserRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('deve lançar erro se email ou senha estiverem ausentes', async () => {
      await expect(AuthService.login({ email: '', password: '' }))
        .rejects.toThrow('Email e senha são obrigatórios.');
    });

    it('deve lançar erro se usuário não for encontrado', async () => {
      UserRepository.findByEmail.mockResolvedValue(null);
      await expect(AuthService.login({ email: 'nao@existe.com', password: '123456' }))
        .rejects.toThrow('Email ou senha incorretos.');
    });

    it('deve lançar erro se senha estiver incorreta', async () => {
      UserRepository.findByEmail.mockResolvedValue({ id: 1, email: 'a@b.com', password: 'hash', role: 'client' });
      bcrypt.compare.mockResolvedValue(false);
      await expect(AuthService.login({ email: 'a@b.com', password: 'errada' }))
        .rejects.toThrow('Email ou senha incorretos.');
    });

    it('deve autenticar com sucesso e não expor a senha no retorno', async () => {
      UserRepository.findByEmail.mockResolvedValue({
        id: 1, name: 'Teste', email: 'a@b.com', password: 'hash', role: 'client',
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('jwt_token_ok');

      const result = await AuthService.login({ email: 'a@b.com', password: '123456' });

      expect(result.token).toBe('jwt_token_ok');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('a@b.com');
    });
  });
});
