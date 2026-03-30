// routes/avaliacaoRoutes.js
const express              = require("express");
const router               = express.Router({ mergeParams: true });
const AvaliacaoController  = require("../controllers/avaliacaoController");
const authMiddleware        = require("../middlewares/authMiddleware");

// GET /api/avaliacoes/:produtoId — público
router.get("/:produtoId", AvaliacaoController.listar);

// POST /api/avaliacoes/:produtoId — apenas logados
router.post("/:produtoId", authMiddleware, AvaliacaoController.criar);

module.exports = router;
