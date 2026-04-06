/**
 * @file database.js
 * @description Instância única (Singleton) do Prisma Client.
 *
 * @pattern Singleton (Criacional)
 * @problem O Prisma Client é pesado para instanciar. Com hot-reload (nodemon),
 *          cada restart criaria uma nova instância, acumulando conexões abertas
 *          e causando o aviso "There are already 10 instances of Prisma Client".
 * @solution Armazena a instância na variável global do Node.js. Se já existir
 *           uma instância, reutiliza ela. Caso contrário, cria uma nova.
 * @benefit  Toda a aplicação compartilha uma única conexão com o banco,
 *           evitando vazamento de conexões em desenvolvimento.
 */
 
const { PrismaClient } = require("@prisma/client");
 
/**
 * Instância Singleton do Prisma Client.
 * Em desenvolvimento: reutiliza a instância global para evitar
 * múltiplas conexões durante o hot-reload do nodemon.
 * Em produção: cria uma nova instância normalmente.
 *
 * @type {PrismaClient}
 */
const prisma = global.prisma || new PrismaClient();
 
if (process.env.NODE_ENV !== "production") {
  // Persiste a instância entre reloads do nodemon
  global.prisma = prisma;
}
 
module.exports = prisma;
