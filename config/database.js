// config/database.js
// Singleton do cliente Prisma
// Evita múltiplas instâncias em ambiente de desenvolvimento com hot-reload

const { PrismaClient } = require("@prisma/client");

// Em desenvolvimento, reutiliza a instância global para evitar
// conexões desnecessárias durante hot-reload do nodemon
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;
