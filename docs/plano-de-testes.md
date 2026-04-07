# Plano de Testes — E-commerce de Periféricos

**Projeto Integrador de Módulo — ADS 4º Período — PUC Goiás**
**Semestre:** 2026/1
**Versão:** 1.0

---

## 1. Objetivo

Este documento define os cenários de teste, critérios de aceitação e requisitos não-funcionais para o sistema de e-commerce de periféricos, garantindo que a aplicação atenda aos requisitos funcionais, de qualidade e de integração com mensageria (Kafka).

---

## 2. Escopo

O plano cobre os seguintes módulos:

| Módulo | Descrição |
|---|---|
| Autenticação | Cadastro, login e controle de acesso por JWT |
| Produtos | CRUD de produtos (público e admin) |
| Pedidos | Criação, listagem, cancelamento e fluxo de estados |
| Mensageria | Publicação e consumo de eventos via Kafka |
| Avaliações | Criação e listagem de avaliações por produto |

---

## 3. Tipos de Teste

| Tipo | Objetivo | Ferramenta |
|---|---|---|
| Unitário | Testar funções/serviços isoladamente | Jest |
| Integração | Testar rotas da API com banco real | Jest + Supertest |
| Manual (Funcional) | Validar fluxo completo via interface | Postman / Navegador |
| Mensageria | Validar publicação/consumo de eventos Kafka | Console + Logs |

---

## 4. Cenários de Teste

### 4.1 Autenticação

| ID | Cenário | Entrada | Resultado Esperado | Tipo |
|---|---|---|---|---|
| AUTH-01 | Cadastro com dados válidos | nome, email, senha válidos | HTTP 201, usuário criado | Integração |
| AUTH-02 | Cadastro com e-mail já existente | e-mail duplicado | HTTP 409, mensagem de conflito | Integração |
| AUTH-03 | Cadastro com campos obrigatórios faltando | sem senha | HTTP 400, mensagem de validação | Integração |
| AUTH-04 | Login com credenciais corretas | email + senha válidos | HTTP 200, token JWT retornado | Integração |
| AUTH-05 | Login com senha incorreta | senha errada | HTTP 401, acesso negado | Integração |
| AUTH-06 | Login com e-mail inexistente | email não cadastrado | HTTP 404 ou 401 | Integração |
| AUTH-07 | Acesso a rota protegida sem token | sem header Authorization | HTTP 401 | Integração |
| AUTH-08 | Acesso a rota protegida com token válido | token JWT válido | HTTP 200, dados retornados | Integração |
| AUTH-09 | Acesso a rota de admin com perfil cliente | token de cliente | HTTP 403, acesso negado | Integração |

---

### 4.2 Produtos

| ID | Cenário | Entrada | Resultado Esperado | Tipo |
|---|---|---|---|---|
| PROD-01 | Listar todos os produtos (público) | sem autenticação | HTTP 200, array de produtos | Integração |
| PROD-02 | Buscar produto por ID válido | ID existente | HTTP 200, dados do produto | Integração |
| PROD-03 | Buscar produto por ID inválido | ID inexistente | HTTP 404 | Integração |
| PROD-04 | Criar produto como admin | token admin + dados válidos | HTTP 201, produto criado | Integração |
| PROD-05 | Criar produto como cliente | token cliente | HTTP 403 | Integração |
| PROD-06 | Criar produto sem autenticação | sem token | HTTP 401 | Integração |
| PROD-07 | Atualizar produto como admin | token admin + dados | HTTP 200, produto atualizado | Integração |
| PROD-08 | Deletar produto como admin | token admin + ID | HTTP 200, produto removido | Integração |
| PROD-09 | Criar produto com campos faltando | sem nome ou preço | HTTP 400 | Integração |

---

### 4.3 Pedidos

| ID | Cenário | Entrada | Resultado Esperado | Tipo |
|---|---|---|---|---|
| PED-01 | Criar pedido autenticado com produto válido | token + lista de itens | HTTP 201, pedido criado | Integração |
| PED-02 | Criar pedido sem autenticação | sem token | HTTP 401 | Integração |
| PED-03 | Criar pedido com produto inexistente | ID de produto inválido | HTTP 404 | Integração |
| PED-04 | Listar pedidos do usuário logado | token válido | HTTP 200, lista de pedidos | Integração |
| PED-05 | Admin visualiza todos os pedidos | token admin | HTTP 200, todos os pedidos | Integração |
| PED-06 | Cliente tenta visualizar todos os pedidos | token cliente | HTTP 403 | Integração |
| PED-07 | Buscar pedido por ID (próprio) | token + ID do pedido | HTTP 200, dados do pedido | Integração |
| PED-08 | Cancelar pedido dentro do prazo (24h) | token + ID do pedido recente | HTTP 200, status cancelado | Integração |
| PED-09 | Cancelar pedido após 24h | token + pedido antigo | HTTP 400 ou 403 | Integração |
| PED-10 | Pedido publicado no tópico Kafka ao ser criado | criação de pedido | Evento visível no consumer Kafka | Mensageria |
| PED-11 | Consumer Kafka recebe e processa o pedido | evento no tópico "pedidos" | Log do consumer exibe dados do pedido | Mensageria |

---

### 4.4 Avaliações

| ID | Cenário | Entrada | Resultado Esperado | Tipo |
|---|---|---|---|---|
| AVAL-01 | Listar avaliações de produto (público) | ID do produto | HTTP 200, lista de avaliações | Integração |
| AVAL-02 | Criar avaliação autenticado | token + nota + comentário | HTTP 201, avaliação registrada | Integração |
| AVAL-03 | Criar avaliação sem autenticação | sem token | HTTP 401 | Integração |
| AVAL-04 | Criar avaliação com nota inválida | nota fora do intervalo 1–5 | HTTP 400 | Integração |

---

### 4.5 Fluxo End-to-End (Funcional Manual)

| ID | Cenário | Passos | Resultado Esperado |
|---|---|---|---|
| E2E-01 | Jornada completa do cliente | 1. Cadastrar → 2. Login → 3. Ver produtos → 4. Fazer pedido → 5. Ver pedidos | Pedido criado e visível na listagem |
| E2E-02 | Jornada do admin | 1. Login admin → 2. Criar produto → 3. Ver todos os pedidos | Produto criado e pedidos listados |
| E2E-03 | Fluxo Kafka | 1. Criar pedido → 2. Verificar log do consumer | Consumer exibe dados do pedido no console |

---

## 5. Requisitos Não-Funcionais

| ID | Categoria | Requisito | Métrica |
|---|---|---|---|
| RNF-01 | Desempenho | A API deve responder requisições simples em tempo aceitável | < 500ms para rotas de leitura |
| RNF-02 | Segurança | Senhas devem ser armazenadas com hash | bcrypt com salt rounds ≥ 10 |
| RNF-03 | Segurança | Rotas protegidas devem rejeitar tokens inválidos/expirados | HTTP 401 em todos os casos |
| RNF-04 | Segurança | Apenas admins podem criar, editar e deletar produtos | HTTP 403 para outros perfis |
| RNF-05 | Disponibilidade | O sistema deve subir corretamente via Docker Compose | `docker compose up` funcional sem erros |
| RNF-06 | Mensageria | O Kafka deve processar eventos de pedido de forma assíncrona | Consumer confirma recebimento sem bloquear a API |
| RNF-07 | Manutenibilidade | O código deve seguir separação em camadas (Controller → Service → Repository) | Estrutura de pastas respeitada |
| RNF-08 | Portabilidade | O ambiente de desenvolvimento deve ser reproduzível | Instruções no README suficientes para rodar o projeto |
| RNF-09 | Usabilidade | A interface deve ser responsiva e intuitiva | Compatível com resoluções desktop (≥ 1280px) |
| RNF-10 | Rastreabilidade | Erros da API devem retornar mensagens descritivas | Corpo da resposta com campo `message` |

---

## 6. Critérios de Aceitação

- Todos os cenários marcados como **Integração** devem ser cobertos por testes automatizados na N2.
- Os cenários de **Mensageria** devem ser demonstrados via log durante a apresentação.
- Os cenários **E2E** serão validados manualmente durante o pitch.
- Os **Requisitos Não-Funcionais** de segurança (RNF-02, RNF-03, RNF-04) são obrigatórios e serão verificados na banca.

---

## 7. Ferramentas

| Ferramenta | Uso |
|---|---|
| Jest | Testes unitários e de integração |
| Supertest | Simulação de requisições HTTP nos testes |
| Postman | Testes manuais da API (coleção disponível em `perifericos_postman.json`) |
| Docker Compose | Subir Kafka, Zookeeper e banco de dados |
| SonarQube (N2) | Análise estática de código |

---

*Documento elaborado para a entrega N1 do Projeto Integrador de Módulo — ADS 4º Período — PUC Goiás — 2026/1*
