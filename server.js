require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const authRoutes      = require("./routes/authRoutes");
const productRoutes   = require("./routes/productRoutes");
const orderRoutes     = require("./routes/orderRoutes");
const avaliacaoRoutes = require("./routes/avaliacaoRoutes");
const pedidosRoutes   = require("./src/routes/pedidos");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000/pages"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend page routes
const pages = path.join(__dirname, "frontend", "pages");
app.get("/",          (req, res) => res.sendFile(path.join(pages, "index.html")));
app.get("/login",     (req, res) => res.sendFile(path.join(pages, "login.html")));
app.get("/cadastro",  (req, res) => res.sendFile(path.join(pages, "cadastro.html")));
app.get("/carrinho",  (req, res) => res.sendFile(path.join(pages, "carrinho.html")));
app.get("/pedidos",   (req, res) => res.sendFile(path.join(pages, "pedidos.html")));
app.get("/produto",   (req, res) => res.sendFile(path.join(pages, "produto.html")));
app.get("/pagamento", (req, res) => res.sendFile(path.join(pages, "pagamento.html")));
app.get("/admin",     (req, res) => res.sendFile(path.join(pages, "admin.html")));

// Serve static files (CSS, JS, images) from the frontend folder
app.use(express.static(path.join(__dirname, "frontend")));

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
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}/pages/`);
});

module.exports = app;
