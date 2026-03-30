// middlewares/authMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Middleware de autenticação JWT
// Verifica se o token é válido e injeta o usuário na requisição (req.user)
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const ResponseFactory = require("../config/responseFactory");

const authMiddleware = (req, res, next) => {
  try {
    // 1. Extrai o token do header Authorization
    // Formato esperado: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseFactory.unauthorized(res, "Token de autenticação não fornecido");
    }

    const token = authHeader.split(" ")[1]; // Pega apenas o token, sem "Bearer "

    // 2. Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Injeta os dados do usuário na requisição para uso nos controllers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // 4. Passa para o próximo middleware/controller
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return ResponseFactory.unauthorized(res, "Token expirado. Faça login novamente.");
    }
    if (error.name === "JsonWebTokenError") {
      return ResponseFactory.unauthorized(res, "Token inválido.");
    }
    return ResponseFactory.serverError(res, "Erro ao verificar autenticação");
  }
};

module.exports = authMiddleware;
