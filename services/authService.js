// services/authService.js
// Camada de serviço: contém a lógica de negócio de autenticação
// Não conhece Express (req/res) — só trabalha com dados puros

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");

const AuthService = {
  /**
   * Registra um novo usuário
   * @param {object} data - { name, email, password }
   */
  async register(data) {
    const { name, email, password } = data;

    // Validações de negócio
    if (!name || !email || !password) {
      throw new Error("Nome, email e senha são obrigatórios");
    }

    if (password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres");
    }

    // Verifica se email já está em uso
    const emailExists = await UserRepository.emailExists(email);
    if (emailExists) {
      const err = new Error("Este email já está cadastrado");
      err.statusCode = 409; // Conflict
      throw err;
    }

    // Hash da senha com bcrypt (custo 10 = bom equilíbrio segurança/performance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário (sempre como "client" — admin é criado via seed)
    const user = await UserRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "client",
    });

    // Gera token JWT imediatamente após o registro
    const token = this._generateToken(user);

    return { user, token };
  },

  /**
   * Realiza login do usuário
   * @param {object} data - { email, password }
   */
  async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    // Busca usuário com a senha (findByEmail retorna tudo, incluindo password)
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      // Mensagem genérica por segurança (não revela se o email existe)
      throw new Error("Email ou senha incorretos");
    }

    // Compara senha fornecida com o hash armazenado
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Email ou senha incorretos");
    }

    // Remove a senha do objeto antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    // Gera token JWT
    const token = this._generateToken(user);

    return { user: userWithoutPassword, token };
  },

  /**
   * Gera um token JWT com as informações do usuário
   * @private
   */
  _generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  },
};

module.exports = AuthService;
