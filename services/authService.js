/**
 * @file authService.js
 * @description Serviço de autenticação — lógica de negócio de registro e login.
 *
 * @principle SOLID — Single Responsibility (S)
 * @description Este service tem UMA única responsabilidade: lógica de
 *              autenticação (hash de senha, geração de JWT, validações).
 *              Não manipula objetos HTTP (req/res) — isso é papel do controller.
 *
 * @principle SOLID — Dependency Inversion (D)
 * @description Depende da abstração UserRepository, não da implementação
 *              concreta do Prisma. O service não sabe como o banco funciona.
 */
 
const bcrypt         = require("bcryptjs");
const jwt            = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");
 
const AuthService = {
 
  /**
   * Registra um novo usuário no sistema.
   * Valida os dados, faz hash da senha e gera JWT.
   *
   * @param {object} data          - Dados do novo usuário
   * @param {string} data.name     - Nome completo
   * @param {string} data.email    - Email único
   * @param {string} data.password - Senha em texto puro (será hasheada)
   * @returns {Promise<{user: object, token: string}>}
   * @throws {Error} Se email já cadastrado ou dados inválidos
   */
  async register(data) {
    const { name, email, password } = data;
 
    // Validações de negócio
    if (!name || !email || !password) {
      throw new Error("Nome, email e senha são obrigatórios.");
    }
    if (password.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }
 
    // Verifica se email já está em uso
    const emailExiste = await UserRepository.emailExists(email);
    if (emailExiste) {
      const err = new Error("Este email já está cadastrado.");
      err.statusCode = 409;
      throw err;
    }
 
    // Hash da senha — custo 10 = bom equilíbrio entre segurança e performance
    const senhaCriptografada = await bcrypt.hash(password, 10);
 
    // Cria o usuário sempre como "client" — admin é criado via seed
    const usuario = await UserRepository.create({
      name,
      email,
      password: senhaCriptografada,
      role:     "client",
    });
 
    // Gera token JWT imediatamente após o registro
    const token = this._gerarToken(usuario);
 
    return { user: usuario, token };
  },
 
  /**
   * Autentica um usuário e retorna JWT.
   *
   * @param {object} data          - Credenciais do usuário
   * @param {string} data.email    - Email cadastrado
   * @param {string} data.password - Senha em texto puro
   * @returns {Promise<{user: object, token: string}>}
   * @throws {Error} Se credenciais inválidas
   */
  async login(data) {
    const { email, password } = data;
 
    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios.");
    }
 
    // Busca usuário com a senha (necessário para o bcrypt.compare)
    const usuario = await UserRepository.findByEmail(email);
 
    if (!usuario) {
      // Mensagem genérica por segurança — não revela se o email existe
      throw new Error("Email ou senha incorretos.");
    }
 
    // Compara a senha fornecida com o hash armazenado
    const senhaCorreta = await bcrypt.compare(password, usuario.password);
 
    if (!senhaCorreta) {
      throw new Error("Email ou senha incorretos.");
    }
 
    // Remove a senha do objeto antes de retornar
    const { password: _, ...usuarioSemSenha } = usuario;
 
    // Gera token JWT
    const token = this._gerarToken(usuario);
 
    return { user: usuarioSemSenha, token };
  },
 
  /**
   * Gera um token JWT com os dados do usuário.
   * Token expira conforme JWT_EXPIRES_IN no .env (padrão: 7d).
   *
   * @private
   * @param {object} usuario - Dados do usuário
   * @returns {string} Token JWT assinado
   */
  _gerarToken(usuario) {
    return jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
  },
};
 
module.exports = AuthService;
 
