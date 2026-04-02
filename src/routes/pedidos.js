const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { publicarPedido } = require("../producer/pedidoProducer");

const router = express.Router();

router.post("/", async (req, res) => {
  const { itens } = req.body;

  const pedido = {
    id: uuidv4(),
    itens,
    status: "PROCESSANDO",
    criadoEm: new Date().toISOString(),
  };

  await publicarPedido(pedido);

  res.status(201).json({ success: true, pedido });
});

module.exports = router;
