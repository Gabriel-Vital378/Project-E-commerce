/**
 * @file responseFactory.js
 * @description Centraliza a criação de respostas padronizadas da API REST.
 *
 * @pattern Factory Method (Criacional)
 * @problem Cada controller retornava respostas HTTP em formatos diferentes,
 *          tornando o frontend frágil por não ter um contrato fixo.
 * @solution O ResponseFactory centraliza a criação de todos os objetos de
 *           resposta. É um objeto com métodos estáticos que constroem
 *           respostas no formato { success, message, data }.
 * @benefit  Todas as respostas seguem o mesmo contrato. Alterar o formato
 *           das respostas exige mudança em apenas um arquivo.
 */
 
const ResponseFactory = {
 
  /**
   * Cria uma resposta de sucesso padronizada.
   * @param {object} res        - Objeto response do Express
   * @param {any}    data       - Dados a retornar ao cliente
   * @param {string} message    - Mensagem descritiva
   * @param {number} statusCode - HTTP status code (padrão: 200)
   * @returns {object} Resposta JSON: { success: true, message, data }
   */
  success(res, data = null, message = "Operação realizada com sucesso", statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  },
 
  /**
   * Cria uma resposta de criação bem-sucedida (201 Created).
   * @param {object} res     - Objeto response do Express
   * @param {any}    data    - Recurso criado
   * @param {string} message - Mensagem descritiva
   */
  created(res, data, message = "Recurso criado com sucesso") {
    return this.success(res, data, message, 201);
  },
 
  /**
   * Cria uma resposta de erro padronizada.
   * @param {object} res        - Objeto response do Express
   * @param {string} message    - Mensagem de erro
   * @param {number} statusCode - HTTP status code (padrão: 400)
   * @param {any}    errors     - Detalhes dos erros (opcional)
   * @returns {object} Resposta JSON: { success: false, message }
   */
  error(res, message = "Ocorreu um erro", statusCode = 400, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  },
 
  /**
   * Cria uma resposta 401 — não autenticado.
   * @param {object} res     - Objeto response do Express
   * @param {string} message - Mensagem de erro
   */
  unauthorized(res, message = "Não autorizado. Faça login para continuar.") {
    return this.error(res, message, 401);
  },
 
  /**
   * Cria uma resposta 403 — sem permissão.
   * @param {object} res     - Objeto response do Express
   * @param {string} message - Mensagem de erro
   */
  forbidden(res, message = "Acesso negado. Permissão insuficiente.") {
    return this.error(res, message, 403);
  },
 
  /**
   * Cria uma resposta 404 — recurso não encontrado.
   * @param {object} res     - Objeto response do Express
   * @param {string} message - Mensagem de erro
   */
  notFound(res, message = "Recurso não encontrado") {
    return this.error(res, message, 404);
  },
 
  /**
   * Cria uma resposta 500 — erro interno do servidor.
   * @param {object} res     - Objeto response do Express
   * @param {string} message - Mensagem de erro
   */
  serverError(res, message = "Erro interno do servidor") {
    return this.error(res, message, 500);
  },
 
  /**
   * Cria uma resposta paginada para listagens.
   * @param {object} res    - Objeto response do Express
   * @param {Array}  data   - Lista de itens
   * @param {number} total  - Total de itens no banco
   * @param {number} page   - Página atual
   * @param {number} limit  - Itens por página
   * @param {string} message - Mensagem descritiva
   */
  paginated(res, data, total, page, limit, message = "Dados recuperados com sucesso") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  },
};
 
module.exports = ResponseFactory;
