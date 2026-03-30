// routes/orderRoutes.js
const express         = require("express");
const router          = express.Router();
const OrderController = require("../controllers/orderController");
const authMiddleware   = require("../middlewares/authMiddleware");
const roleMiddleware   = require("../middlewares/roleMiddleware");

router.use(authMiddleware);

router.post("/",          OrderController.create);
router.get("/my",         OrderController.getMyOrders);
router.get("/",           roleMiddleware("admin"), OrderController.getAll);
router.get("/:id",        OrderController.getById);

// PATCH /api/orders/:id/cancelar — cancela pedido (cliente, até 24h)
router.patch("/:id/cancelar", OrderController.cancelar);

module.exports = router;
