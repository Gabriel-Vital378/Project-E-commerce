# ⌨ Periféricos.shop — E-commerce Full Stack

Sistema de e-commerce de periféricos (mouse, teclado, headset) com Node.js + Express + Prisma (SQLite) no backend e HTML/CSS/JS puro no frontend.

---

## 🗂 Estrutura do Projeto

```
ecommerce/
├── backend/
│   ├── config/
│   │   ├── database.js          # Singleton do Prisma Client
│   │   └── responseFactory.js   # Factory Pattern de respostas API
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifica JWT
│   │   └── roleMiddleware.js    # Verifica role (admin)
│   ├── repositories/            # Repository Pattern
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   └── orderRepository.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   └── orderService.js
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco (SQLite)
│   │   └── seed.js              # Dados iniciais (admin + 12 produtos)
│   ├── server.js
│   ├── package.json
│   └── .env                     # Variáveis de ambiente
│
└── frontend/
    ├── css/
    │   └── style.css            # Design system customizado
    ├── js/
    │   └── utils.js             # API client, auth, cart, toast, fmt
    └── pages/
        ├── login.html
        ├── register.html
        ├── index.html           # Listagem de produtos
        ├── product.html         # Detalhe do produto
        ├── cart.html            # Carrinho + checkout
        ├── orders.html          # Meus pedidos
        └── admin.html           # Painel admin (CRUD)
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) v18+ instalado
- Terminal (PowerShell, bash, etc.)

---

### 1. Instalar dependências do backend

```bash
cd ecommerce/backend
npm install
```

---

### 2. Configurar o banco de dados

O projeto usa **SQLite** (sem necessidade de instalar nenhum servidor de banco).

```bash
# Ainda dentro de ecommerce/backend/

# Cria o banco e gera as tabelas a partir do schema.prisma
npx prisma db push

# Popula o banco com produtos e usuários de teste
npm run seed
```

Após o seed, você terá:

| Usuário                    | Senha       | Role   |
|----------------------------|-------------|--------|
| admin@perifericos.com      | admin123    | admin  |
| cliente@email.com          | cliente123  | client |

E 12 produtos nas categorias mouse, teclado e headset.

---

### 3. Iniciar o backend

```bash
npm run dev
```

O servidor irá rodar em: **http://localhost:3001**

Teste rápido: acesse http://localhost:3001/health no navegador.

---

### 4. Abrir o frontend

O frontend é HTML puro, então basta servi-lo com qualquer servidor estático.

**Opção A — VS Code Live Server (recomendado):**
1. Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Clique com botão direito em `frontend/pages/index.html`
3. Selecione **"Open with Live Server"**
4. O frontend abrirá em `http://127.0.0.1:5500`

**Opção B — Python (se tiver instalado):**
```bash
cd ecommerce/frontend
python -m http.server 5500
# Abra: http://localhost:5500/pages/index.html
```

**Opção C — npx serve:**
```bash
cd ecommerce/frontend
npx serve -p 5500
# Abra: http://localhost:5500/pages/index.html
```

---

## 🔗 Endpoints da API

### Autenticação
| Método | Rota                | Descrição             | Auth |
|--------|---------------------|-----------------------|------|
| POST   | /api/auth/register  | Cadastro de usuário   | ❌   |
| POST   | /api/auth/login     | Login (retorna JWT)   | ❌   |
| GET    | /api/auth/me        | Dados do usuário      | ✅   |

### Produtos
| Método | Rota                  | Descrição               | Auth    |
|--------|-----------------------|-------------------------|---------|
| GET    | /api/products         | Lista produtos (filtros)| ❌      |
| GET    | /api/products/:id     | Detalhes do produto     | ❌      |
| POST   | /api/products         | Cria produto            | ✅ Admin |
| PUT    | /api/products/:id     | Atualiza produto        | ✅ Admin |
| DELETE | /api/products/:id     | Remove produto          | ✅ Admin |

Query params para GET /api/products:
- `?category=mouse` — filtra por categoria
- `?search=logitech` — busca por nome/descrição
- `?page=1&limit=12` — paginação

### Pedidos
| Método | Rota              | Descrição              | Auth    |
|--------|-------------------|------------------------|---------|
| POST   | /api/orders       | Cria pedido            | ✅      |
| GET    | /api/orders/my    | Meus pedidos           | ✅      |
| GET    | /api/orders       | Todos os pedidos       | ✅ Admin |
| GET    | /api/orders/:id   | Detalhes do pedido     | ✅      |

---

## 🧩 Design Patterns Implementados

### 1. Repository Pattern
**Localização:** `backend/repositories/`

Abstrai o acesso ao banco de dados. Os services não conhecem o Prisma diretamente.

```
Service → Repository → Prisma → SQLite
```

Benefícios:
- Fácil trocar o banco de dados (só muda o repositório)
- Código testável (fácil de mockar)
- Separação clara de responsabilidades

### 2. Factory Pattern
**Localização:** `backend/config/responseFactory.js`

Cria objetos de resposta HTTP padronizados.

```javascript
// Em vez de:
res.status(201).json({ success: true, data: product, message: "..." })

// Usamos:
ResponseFactory.created(res, product, "Produto criado!")
```

Benefícios:
- Todas as respostas da API têm o mesmo formato
- Fácil manutenção (muda em um lugar, reflete em toda API)
- Código mais legível

---

## 🏗 Arquitetura em Camadas

```
HTTP Request
    ↓
Route (routes/)          — define URL e middlewares
    ↓
Middleware               — autenticação, autorização
    ↓
Controller (controllers/) — recebe req/res, chama service
    ↓
Service (services/)      — lógica de negócio pura
    ↓
Repository (repositories/) — acesso ao banco de dados
    ↓
Prisma ORM
    ↓
SQLite
```

---

## 🎨 Tecnologias

**Backend:**
- Node.js + Express.js
- Prisma ORM (SQLite)
- JWT (jsonwebtoken)
- bcryptjs (hash de senhas)
- CORS

**Frontend:**
- HTML5 semântico
- CSS customizado + Bootstrap 5
- JavaScript ES6+ (Fetch API, async/await)
- LocalStorage (JWT + carrinho)
- Google Fonts (Rajdhani + Inter)

---

## 🔐 Segurança

- Senhas armazenadas com hash bcrypt (custo 10)
- JWT com expiração configurável
- Middleware de autenticação em todas as rotas protegidas
- Middleware de role para rotas admin
- Mensagens de erro genéricas no login (não revelam se email existe)
- CORS configurado para aceitar apenas o frontend

---

## ⚠ Notas de Desenvolvimento

- Este é um projeto de **estudo/demonstração**
- O checkout é **simulado** (nenhum pagamento real)
- Em produção: usar PostgreSQL, HTTPS, variáveis de ambiente reais, rate limiting, etc.
- O arquivo `.env` está incluído por conveniência — em produção, **nunca commitar o .env**
