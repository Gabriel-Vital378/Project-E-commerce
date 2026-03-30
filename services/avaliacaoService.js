// services/avaliacaoService.js
const AvaliacaoRepository = require("../repositories/avaliacaoRepository");

const AvaliacaoService = {

  async listarPorProduto(produtoId) {
    const avaliacoes = await AvaliacaoRepository.buscarPorProduto(produtoId);

    // Calcula média das notas
    const total = avaliacoes.length;
    const media = total > 0
      ? avaliacoes.reduce((s, a) => s + a.nota, 0) / total
      : 0;

    return { avaliacoes, media: Number(media.toFixed(1)), total };
  },

  async criar(produtoId, usuarioId, nomeAutor, dados) {
    const { nota, titulo, texto } = dados;

    if (!nota || nota < 1 || nota > 5) throw new Error("Nota deve ser entre 1 e 5.");
    if (!titulo || !texto)             throw new Error("Título e texto são obrigatórios.");

    // Verifica se já avaliou
    const jaAvaliou = await AvaliacaoRepository.jaAvaliou(produtoId, usuarioId);
    if (jaAvaliou) throw new Error("Você já avaliou este produto.");

    // Verifica se comprou
    const comprou = await AvaliacaoRepository.usuarioComprouProduto(usuarioId, produtoId);
    if (!comprou) throw new Error("Você só pode avaliar produtos que comprou.");

    return await AvaliacaoRepository.criar({
      produtoId:  Number(produtoId),
      usuarioId:  Number(usuarioId),
      nota:       Number(nota),
      titulo,
      texto,
      nomeAutor,
      ficticia:   false,
    });
  },
};

module.exports = AvaliacaoService;
