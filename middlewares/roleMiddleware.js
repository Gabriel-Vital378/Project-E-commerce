// middlewares/roleMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Middleware de autorização por role (papel do usuário)
// Deve ser usado APÓS o authMiddleware (depende de req.user)
// ─────────────────────────────────────────────────────────────────────────────

const ResponseFactory = require("../config/responseFactory");

/**
 * Factory function que retorna um middleware de verificação de role
 * Uso: router.post("/products", authMiddleware, roleMiddleware("admin"), controller)
 *
 * @param {...string} roles - Roles permitidas (ex: "admin", "client")
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // Verifica se authMiddleware foi executado antes
    if (!req.user) {
      return ResponseFactory.unauthorized(res, "Usuário não autenticado");
    }

    // Verifica se o role do usuário está na lista de roles permitidas
    if (!roles.includes(req.user.role)) {
      return ResponseFactory.forbidden(
        res,
        `Acesso negado. Apenas ${roles.join(" ou ")} pode acessar este recurso.`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
