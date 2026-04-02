const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "ecommerce-producer",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const conectar = async () => {
  await producer.connect();
  console.log("Producer Kafka conectado.");
};

const publicarPedido = async (pedido) => {
  await producer.send({
    topic: "pedidos",
    messages: [{ value: JSON.stringify(pedido) }],
  });
  console.log("Pedido publicado no Kafka:", pedido);
};

conectar();

module.exports = { publicarPedido };
