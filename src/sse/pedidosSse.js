// src/sse/pedidosSse.js
// Singleton que mantém conexões SSE abertas por userId.
// O consumer do Kafka chama notificar() para fazer push ao cliente.

const conexoes = new Map();

module.exports = {
  registrar(userId, res) {
    conexoes.set(String(userId), res);
  },

  remover(userId) {
    conexoes.delete(String(userId));
  },

  notificar(userId, dados) {
    const res = conexoes.get(String(userId));
    if (res && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(dados)}\n\n`);
    }
  },
};
