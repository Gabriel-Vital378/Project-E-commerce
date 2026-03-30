// repositories/userRepository.js
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Repository Pattern
// ─────────────────────────────────────────────────────────────────────────────
// O Repository Pattern abstrai a camada de acesso a dados.
// A camada de serviço não precisa conhecer os detalhes do ORM (Prisma).
// Benefícios:
//   - Separação de responsabilidades
//   - Fácil troca de banco de dados (basta trocar o repositório)
//   - Código testável (fácil de mockar)
// ─────────────────────────────────────────────────────────────────────────────

const prisma = require("../config/database");

const UserRepository = {
  /**
   * Busca um usuário pelo email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Busca um usuário pelo ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Nunca retorna a senha
      },
    });
  },

  /**
   * Cria um novo usuário
   */
  async create(data) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  },

  /**
   * Verifica se email já existe
   */
  async emailExists(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  },
};

module.exports = UserRepository;
