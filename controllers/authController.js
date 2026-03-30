// controllers/authController.js
// Camada de controller: recebe req/res, chama o service e retorna resposta

const AuthService = require("../services/authService");
const ResponseFactory = require("../config/responseFactory");

const AuthController = {
  /**
   * POST /api/auth/register
   * Registra novo usuário
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });

      return ResponseFactory.created(res, result, "Conta criada com sucesso! Bem-vindo(a)!");
    } catch (error) {
      const statusCode = error.statusCode || 400;
      return ResponseFactory.error(res, error.message, statusCode);
    }
  },

  /**
   * POST /api/auth/login
   * Autentica usuário e retorna JWT
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });

      return ResponseFactory.success(res, result, "Login realizado com sucesso!");
    } catch (error) {
      return ResponseFactory.error(res, error.message, 401);
    }
  },

  /**
   * GET /api/auth/me
   * Retorna dados do usuário logado
   */
  async me(req, res) {
    try {
      // req.user é injetado pelo authMiddleware
      return ResponseFactory.success(res, req.user, "Dados do usuário recuperados");
    } catch (error) {
      return ResponseFactory.serverError(res);
    }
  },
};

module.exports = AuthController;
