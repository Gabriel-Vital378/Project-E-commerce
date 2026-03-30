// routes/productRoutes.js
// Definição das rotas de produtos

const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// ─── Rotas públicas (não precisam de autenticação) ─────────────────────────
// GET /api/products          — Lista todos os produtos
router.get("/", ProductController.getAll);

// GET /api/products/:id      — Detalhes de um produto
router.get("/:id", ProductController.getById);

// ─── Rotas protegidas (apenas admin) ──────────────────────────────────────
// POST /api/products         — Cria novo produto
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  ProductController.create
);

// PUT /api/products/:id      — Atualiza produto
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  ProductController.update
);

// DELETE /api/products/:id   — Remove produto
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  ProductController.delete
);

module.exports = router;
