const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "ecommerce-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "grupo-pedidos" });

const iniciar = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "pedidos", fromBeginning: true });

  console.log("Consumer Kafka conectado. Aguardando pedidos...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const pedido = JSON.parse(message.value.toString());
      console.log("Pedido recebido:", pedido);
    },
  });
};

iniciar();
