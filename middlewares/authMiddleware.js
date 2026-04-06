/**
 * @file authMiddleware.js
 * @description Middleware de autenticação JWT.
 *
 * @pattern Middleware / Decorator (Estrutural)
 * @description Middlewares do Express funcionam como decorators:
 *              adicionam comportamento (verificação JWT) às rotas
 *              sem modificar os controllers.
 *
 * @principle SOLID — Single Responsibility (S)
 * @description Este middleware tem UMA única responsabilidade:
 *              verificar se o token JWT é válido e injetar req.user.
 *              Não decide o que fazer com o usuário — isso é papel
 *              dos controllers e do roleMiddleware.
 */
 
const jwt          = require("jsonwebtoken");
const ResponseFactory = require("../config/responseFactory");
 
/**
 * Middleware que verifica o token JWT no header Authorization.
 * Injeta os dados do usuário em req.user para uso nos controllers.
 *
 * @param {object}   req  - Objeto request do Express
 * @param {object}   res  - Objeto response do Express
 * @param {Function} next - Função para passar ao próximo middleware
 *
 * @example
 * // Uso nas rotas:
 * router.get("/perfil", authMiddleware, controller.getPerfil);
 */
const authMiddleware = (req, res, next) => {
  try {
    // 1. Extrai o token do header Authorization
    // Formato esperado: "Bearer <token>"
    const authHeader = req.headers.authorization;
 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseFactory.unauthorized(res, "Token de autenticação não fornecido.");
    }
 
    // Remove o prefixo "Bearer " e pega apenas o token
    const token = authHeader.split(" ")[1];
 
    // 2. Verifica e decodifica o token usando o segredo do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // 3. Injeta os dados do usuário na requisição
    // Os controllers acessam via req.user.id, req.user.role, etc.
    req.user = {
      id:    decoded.id,
      email: decoded.email,
      role:  decoded.role,
    };
 
    // 4. Passa para o próximo middleware ou controller
    next();
 
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ResponseFactory.unauthorized(res, "Token expirado. Faça login novamente.");
    }
    if (error.name === "JsonWebTokenError") {
      return ResponseFactory.unauthorized(res, "Token inválido.");
    }
    return ResponseFactory.serverError(res, "Erro ao verificar autenticação.");
  }
};
 
module.exports = authMiddleware;
