// config/responseFactory.js
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Factory Pattern
// ─────────────────────────────────────────────────────────────────────────────
// O Factory Pattern cria objetos sem expor a lógica de criação.
// Aqui criamos um "factory" de respostas padronizadas para a API.
// Benefício: todas as respostas seguem o mesmo formato, facilitando
// o consumo pelo frontend e a manutenção do código.
// ─────────────────────────────────────────────────────────────────────────────

const ResponseFactory = {
  /**
   * Resposta de sucesso
   * @param {object} res - Objeto response do Express
   * @param {any} data - Dados a retornar
   * @param {string} message - Mensagem descritiva
   * @param {number} statusCode - HTTP status code (padrão: 200)
   */
  success(res, data = null, message = "Operação realizada com sucesso", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  /**
   * Resposta de criação bem-sucedida (201 Created)
   */
  created(res, data, message = "Recurso criado com sucesso") {
    return this.success(res, data, message, 201);
  },

  /**
   * Resposta de erro
   * @param {object} res - Objeto response do Express
   * @param {string} message - Mensagem de erro
   * @param {number} statusCode - HTTP status code (padrão: 400)
   * @param {any} errors - Detalhes dos erros (opcional)
   */
  error(res, message = "Ocorreu um erro", statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
    };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  },

  /**
   * Resposta de não autorizado (401)
   */
  unauthorized(res, message = "Não autorizado. Faça login para continuar.") {
    return this.error(res, message, 401);
  },

  /**
   * Resposta de proibido (403)
   */
  forbidden(res, message = "Acesso negado. Permissão insuficiente.") {
    return this.error(res, message, 403);
  },

  /**
   * Resposta de não encontrado (404)
   */
  notFound(res, message = "Recurso não encontrado") {
    return this.error(res, message, 404);
  },

  /**
   * Resposta de erro interno (500)
   */
  serverError(res, message = "Erro interno do servidor") {
    return this.error(res, message, 500);
  },

  /**
   * Resposta paginada
   */
  paginated(res, data, total, page, limit, message = "Dados recuperados com sucesso") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  },
};

module.exports = ResponseFactory;
