// routes/orderRoutes.js
const express         = require("express");
const router          = express.Router();
const jwt             = require("jsonwebtoken");
const OrderController = require("../controllers/orderController");
const authMiddleware   = require("../middlewares/authMiddleware");
const roleMiddleware   = require("../middlewares/roleMiddleware");
const sse             = require("../src/sse/pedidosSse");

// SSE: endpoint de status em tempo real — token via query param (EventSource não suporta headers)
// Exemplo: GET /api/orders/stream?token=<jwt>
router.get("/stream", (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).end("Token ausente");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).end("Token inválido");
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Confirmação de conexão
  res.write(`data: ${JSON.stringify({ tipo: "conectado", userId: decoded.id })}\n\n`);

  sse.registrar(decoded.id, res);

  // Remove a conexão quando o cliente desconectar
  req.on("close", () => sse.remover(decoded.id));
});

router.use(authMiddleware);

router.post("/",          OrderController.create);
router.get("/my",         OrderController.getMyOrders);
router.get("/",           roleMiddleware("admin"), OrderController.getAll);
router.get("/:id",        OrderController.getById);

// PATCH /api/orders/:id/cancelar — cancela pedido (cliente, até 24h)
router.patch("/:id/cancelar", OrderController.cancelar);

module.exports = router;
