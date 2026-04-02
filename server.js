require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const authRoutes      = require("./routes/authRoutes");
const productRoutes   = require("./routes/productRoutes");
const orderRoutes     = require("./routes/orderRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const pedidosRoutes   = require("./src/routes/pedidos");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ status: "OK", mensagem: "API funcionando!" }));
app.get("/health", (req, res) => res.json({ status: "OK", mensagem: "API funcionando!" }));

app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/avaliacoes", avaliacaoRoutes);
app.use("/pedidos",       pedidosRoutes);

app.use((err, req, res, next) => {
  console.error("Erro:", err.stack);
  res.status(500).json({ success: false, message: "Erro interno do servidor" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Rota ${req.method} ${req.path} não encontrada` });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
