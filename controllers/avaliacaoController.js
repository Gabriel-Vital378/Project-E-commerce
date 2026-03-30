// controllers/avaliacaoController.js
const AvaliacaoService    = require("../services/avaliacaoService");
const ResponseFactory     = require("../config/responseFactory");

const AvaliacaoController = {

  // GET /api/avaliacoes/:produtoId
  async listar(req, res) {
    try {
      const resultado = await AvaliacaoService.listarPorProduto(req.params.produtoId);
      return ResponseFactory.success(res, resultado);
    } catch (erro) {
      return ResponseFactory.serverError(res, erro.message);
    }
  },

  // POST /api/avaliacoes/:produtoId
  async criar(req, res) {
    try {
      const avaliacao = await AvaliacaoService.criar(
        req.params.produtoId,
        req.user.id,
        req.user.name || req.body.nomeAutor || "Usuário",
        req.body
      );
      return ResponseFactory.created(res, avaliacao, "Avaliação enviada com sucesso!");
    } catch (erro) {
      return ResponseFactory.error(res, erro.message, erro.statusCode || 400);
    }
  },
};

module.exports = AvaliacaoController;
