const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "ecommerce-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

let kafkaDisponivel = false;

const conectar = async () => {
  try {
    await producer.connect();
    kafkaDisponivel = true;
    console.log("Producer Kafka conectado.");
  } catch (err) {
    console.warn("Kafka indisponível — producer não conectado. A API funciona normalmente sem Kafka.");
  }
};

const publicarPedido = async (pedido) => {
  if (!kafkaDisponivel) {
    console.warn("Kafka offline — pedido não publicado no tópico:", pedido);
    return;
  }
  await producer.send({
    topic: "pedidos",
    messages: [{ value: JSON.stringify(pedido) }],
  });
  console.log("Pedido publicado no Kafka:", pedido);
};

conectar();

module.exports = { publicarPedido };
