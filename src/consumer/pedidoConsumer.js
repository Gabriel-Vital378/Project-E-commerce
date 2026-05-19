// src/consumer/pedidoConsumer.js
// Consome mensagens do tópico "pedidos" no Kafka.
// Para cada pedido recebido, simula o processamento atualizando o status
// no banco e notificando o cliente em tempo real via SSE.

const { Kafka } = require("kafkajs");
const prisma = require("../../config/database");
const sse = require("../sse/pedidosSse");

const kafka = new Kafka({
  clientId: "ecommerce-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "grupo-pedidos" });

const aguardar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const atualizarStatus = async (pedidoId, userId, novoStatus) => {
  try {
    await prisma.order.update({
      where: { id: Number(pedidoId) },
      data: { status: novoStatus },
    });
    sse.notificar(userId, { pedidoId, status: novoStatus });
    console.log(`Pedido #${pedidoId} → ${novoStatus}`);
  } catch (err) {
    console.error(`Erro ao atualizar pedido #${pedidoId}:`, err.message);
  }
};

const iniciar = async () => {
  try {
    await consumer.connect();
    // fromBeginning: false — só processa novos pedidos após subir
    await consumer.subscribe({ topic: "pedidos", fromBeginning: false });
    console.log("✅ Consumer Kafka conectado. Aguardando pedidos no tópico 'pedidos'...");

    await consumer.run({
      eachMessage: async ({ message }) => {
        const pedido = JSON.parse(message.value.toString());
        const { id, userId } = pedido;
        console.log(`📦 Pedido #${id} recebido no Kafka (usuário ${userId})`);

        // Simula pipeline de fulfillment com delays realistas
        await aguardar(3000);
        await atualizarStatus(id, userId, "em_preparo");

        await aguardar(7000);
        await atualizarStatus(id, userId, "enviado");

        await aguardar(5000);
        await atualizarStatus(id, userId, "entregue");
      },
    });
  } catch (err) {
    console.warn(
      "⚠️  Consumer Kafka não conectou:",
      err.message,
      "\n   A API funciona normalmente — SSE permanece disponível via polling."
    );
  }
};

iniciar();

module.exports = { consumer };
