/**
 * @file roleMiddleware.js
 * @description Middleware de autorização por perfil (role) do usuário.
 *
 * @principle SOLID — Open/Closed (O)
 * @description O roleMiddleware está ABERTO para extensão e FECHADO para
 *              modificação. Para adicionar um novo perfil (ex: "moderador"),
 *              basta passar o novo role na chamada — sem alterar este arquivo.
 *
 * @principle SOLID — Single Responsibility (S)
 * @description Tem UMA única responsabilidade: verificar se o role do usuário
 *              está na lista de roles permitidos para aquela rota.
 *              Depende do authMiddleware ter sido executado antes (req.user).
 *
 * @example
 * // Uso atual — apenas admin:
 * router.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.delete);
 *
 * // Extensão futura sem modificar o middleware:
 * router.put("/:id", authMiddleware, roleMiddleware("admin", "moderador"), controller.update);
 */
 
const ResponseFactory = require("../config/responseFactory");
 
/**
 * Factory function que retorna um middleware de verificação de role.
 * Deve ser usado APÓS o authMiddleware (depende de req.user).
 *
 * @param {...string} roles - Roles permitidos para acessar a rota
 * @returns {Function} Middleware Express de autorização
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
 
    // Garante que authMiddleware foi executado antes
    if (!req.user) {
      return ResponseFactory.unauthorized(res, "Usuário não autenticado.");
    }
 
    // Verifica se o role do usuário está na lista de roles permitidos
    if (!roles.includes(req.user.role)) {
      return ResponseFactory.forbidden(
        res,
        `Acesso negado. Apenas ${roles.join(" ou ")} pode acessar este recurso.`
      );
    }
 
    // Role autorizado — passa para o próximo middleware/controller
    next();
  };
};
 
module.exports = roleMiddleware;
