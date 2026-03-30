// routes/authRoutes.js
// Definição das rotas de autenticação

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// POST /api/auth/register — Cadastro de novo usuário
router.post("/register", AuthController.register);

// POST /api/auth/login — Login e geração de JWT
router.post("/login", AuthController.login);

// GET /api/auth/me — Dados do usuário logado (rota protegida)
router.get("/me", authMiddleware, AuthController.me);

module.exports = router;
