# ⌨ Periféricos.shop — E-commerce Full Stack

Sistema de e-commerce de periféricos (mouse, teclado, headset) com Node.js + Express + Prisma (SQLite) no backend e HTML/CSS/JS puro no frontend.

---

## 🗂 Estrutura do Projeto

```
perifericos-shop/          ← pasta raiz do projeto
├── backend/
│   ├── config/
│   │   ├── database.js          # Singleton do Prisma Client
│   │   └── responseFactory.js   # Factory Pattern de respostas API
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── avaliacaoController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifica JWT
│   │   └── roleMiddleware.js    # Verifica role (admin)
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── orderRepository.js
│   │   └── avaliacaoRepository.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── avaliacaoRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   └── avaliacaoService.js
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco (SQLite)
│   │   └── seed.js              # Dados iniciais
│   ├── server.js                # Ponto de entrada do servidor
│   ├── package.json
│   └── .env                     # Variáveis de ambiente
│
└── frontend/
    ├── css/
    │   └── estilo.css            # Design system customizado
    ├── js/
    │   └── utilitarios.js        # API client, auth, carrinho, toasts
    └── pages/
        ├── login.html
        ├── cadastro.html
        ├── index.html            # Listagem de produtos
        ├── produto.html          # Detalhe do produto + avaliações
        ├── carrinho.html         # Carrinho de compras
        ├── pagamento.html        # Checkout (Cartão / PIX / Boleto)
        ├── pedidos.html          # Meus pedidos + cancelamento
        └── admin.html            # Painel admin (CRUD)
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) v18+ instalado
- Terminal (PowerShell, bash, etc.)

---

### Primeira execução (apenas uma vez)

```bash
# 1. Entrar na pasta do backend
cd backend

# 2. Instalar dependências
npm install

# 3. Criar o banco de dados SQLite
npx prisma db push

# 4. Popular com dados de demonstração
node prisma/seed.js

# 5. Iniciar o servidor
npm run dev
```

O servidor ficará disponível em: **http://localhost:3001**

Teste rápido: acesse http://localhost:3001/health no navegador.

---

### Execuções seguintes

```bash
# Apenas iniciar o backend (dentro da pasta backend/)
cd backend
npm run dev
```

Para o frontend: abrir `frontend/pages/login.html` com o **Live Server** do VS Code.

---

## 🔗 Endpoints da API

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|----|
| POST | /api/auth/register | Cadastro de usuário | ❌ |
| POST | /api/auth/login | Login (retorna JWT) | ❌ |
| GET  | /api/auth/me | Dados do usuário logado | ✅ |

### Produtos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|----|
| GET    | /api/products | Lista com filtros e paginação | ❌ |
| GET    | /api/products/:id | Detalhes do produto | ❌ |
| POST   | /api/products | Cria produto | ✅ Admin |
| PUT    | /api/products/:id | Atualiza produto | ✅ Admin |
| DELETE | /api/products/:id | Remove produto | ✅ Admin |

### Pedidos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|----|
| POST   | /api/orders | Cria pedido | ✅ |
| GET    | /api/orders/my | Meus pedidos | ✅ |
| GET    | /api/orders | Todos os pedidos | ✅ Admin |
| GET    | /api/orders/:id | Detalhes do pedido | ✅ |
| PATCH  | /api/orders/:id/cancelar | Cancela pedido (24h) | ✅ |

### Avaliações
| Método | Rota | Descrição | Auth |
|--------|------|-----------|----|
| GET    | /api/avaliacoes/:produtoId | Lista avaliações | ❌ |
| POST   | /api/avaliacoes/:produtoId | Cria avaliação | ✅ |

---

## 🔐 Contas de Acesso

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin  | admin@perifericos.com | admin123 |
| Cliente | cliente@email.com | cliente123 |

---

## 🧩 Design Patterns

| Pattern | Categoria | Onde está |
|---------|-----------|-----------|
| Repository | Estrutural | `repositories/` |
| Factory Method | Criacional | `config/responseFactory.js` |
| Singleton | Criacional | `config/database.js` |

---

## 🗄 Banco de Dados

Ver o banco via interface visual:

```bash
# Dentro da pasta backend/
npx prisma studio
```

Abre em: http://localhost:5555

---

## ⚙️ Variáveis de Ambiente (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
PORT=3001
```
