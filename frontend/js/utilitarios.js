// ============================================================
// utilitarios.js — Módulo central compartilhado por todas as páginas
// ============================================================

const URL_API = "http://localhost:3000/api";

// ============================================================
// CLIENTE HTTP — faz requisições para o backend
// ============================================================
const cliente = {

  async requisitar(caminho, opcoes = {}) {
    const token = autenticacao.obterToken();

    const cabecalhos = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": "Bearer " + token } : {}),
    };

    try {
      const resposta = await fetch(URL_API + caminho, {
        ...opcoes,
        headers: cabecalhos,
      });

      const dados = await resposta.json();

      // Token expirado → desloga
      if (resposta.status === 401) {
        autenticacao.sair();
        return dados;
      }

      return { ok: resposta.ok, status: resposta.status, ...dados };

    } catch (erro) {
      console.error("Erro de conexão:", erro);
      return { ok: false, success: false, message: "Servidor offline ou inacessível. Verifique se o backend está rodando na porta 3001." };
    }
  },

  buscar:   (caminho)        => cliente.requisitar(caminho, { method: "GET" }),
  enviar:   (caminho, corpo) => cliente.requisitar(caminho, { method: "POST",   body: JSON.stringify(corpo) }),
  atualizar:(caminho, corpo) => cliente.requisitar(caminho, { method: "PUT",    body: JSON.stringify(corpo) }),
  deletar:  (caminho)        => cliente.requisitar(caminho, { method: "DELETE" }),
};

// ============================================================
// AUTENTICAÇÃO — JWT no localStorage
// ============================================================
const autenticacao = {

  obterToken() {
    return localStorage.getItem("token");
  },

  obterUsuario() {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  },

  estaLogado() {
    return !!this.obterToken();
  },

  eAdmin() {
    return this.obterUsuario()?.role === "admin";
  },

  salvar(token, usuario) {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  },

  sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  },

  // Redireciona para login se não autenticado
  exigirLogin() {
    if (!this.estaLogado()) {
      window.location.href = "/login";
      return false;
    }
    return true;
  },

  // Redireciona se não for admin
  exigirAdmin() {
    if (!this.estaLogado()) {
      window.location.href = "/login";
      return false;
    }
    if (!this.eAdmin()) {
      window.location.href = "/";
      return false;
    }
    return true;
  },
};

// ============================================================
// CARRINHO — armazenado no localStorage
// ============================================================
const carrinho = {

  obter() {
    try {
      return JSON.parse(localStorage.getItem("carrinho") || "[]");
    } catch {
      return [];
    }
  },

  salvar(itens) {
    localStorage.setItem("carrinho", JSON.stringify(itens));
    this.atualizarBadge();
  },

  adicionar(produto, quantidade) {
    quantidade = quantidade || 1;
    const itens = this.obter();
    const existente = itens.find(function(i) { return i.id === produto.id; });

    if (existente) {
      existente.quantidade = Math.min(existente.quantidade + quantidade, produto.stock);
    } else {
      itens.push({
        id:         produto.id,
        nome:       produto.name,
        preco:      produto.price,
        imagem:     produto.image,
        categoria:  produto.category,
        estoque:    produto.stock,
        quantidade: quantidade,
      });
    }

    this.salvar(itens);
    notificacao.sucesso('"' + produto.name + '" adicionado ao carrinho!');
  },

  remover(idProduto) {
    const itens = this.obter().filter(function(i) { return i.id !== idProduto; });
    this.salvar(itens);
  },

  alterarQuantidade(idProduto, novaQuantidade) {
    const itens = this.obter();
    const item = itens.find(function(i) { return i.id === idProduto; });
    if (item) {
      if (novaQuantidade <= 0) {
        this.remover(idProduto);
        return;
      }
      item.quantidade = Math.min(novaQuantidade, item.estoque);
      this.salvar(itens);
    }
  },

  limpar() {
    localStorage.removeItem("carrinho");
    this.atualizarBadge();
  },

  contarItens() {
    return this.obter().reduce(function(soma, i) { return soma + i.quantidade; }, 0);
  },

  calcularTotal() {
    return this.obter().reduce(function(soma, i) { return soma + (i.preco * i.quantidade); }, 0);
  },

  atualizarBadge() {
    const badge = document.getElementById("badge-carrinho");
    if (badge) {
      const total = this.contarItens();
      badge.textContent = total;
      badge.style.display = total > 0 ? "inline-flex" : "none";
    }
  },
};

// ============================================================
// NOTIFICAÇÕES TOAST
// ============================================================
const notificacao = {

  mostrar(mensagem, tipo) {
    tipo = tipo || "info";
    const icones = { sucesso: "✓", erro: "✕", info: "ℹ", aviso: "⚠" };

    let container = document.getElementById("container-notificacoes");
    if (!container) {
      container = document.createElement("div");
      container.id = "container-notificacoes";
      container.style.cssText = "position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
      document.body.appendChild(container);
    }

    const elemento = document.createElement("div");
    elemento.className = "toast-item " + tipo;
    elemento.innerHTML =
      '<span class="toast-icon">' + (icones[tipo] || "ℹ") + '</span>' +
      '<span class="toast-msg">' + mensagem + '</span>';

    container.appendChild(elemento);

    setTimeout(function() {
      elemento.classList.add("hiding");
      setTimeout(function() { elemento.remove(); }, 300);
    }, 3500);
  },

  sucesso: function(msg) { notificacao.mostrar(msg, "sucesso"); },
  erro:    function(msg) { notificacao.mostrar(msg, "erro"); },
  info:    function(msg) { notificacao.mostrar(msg, "info"); },
  aviso:   function(msg) { notificacao.mostrar(msg, "aviso"); },
};

// ============================================================
// FORMATAÇÃO
// ============================================================
const formatar = {

  moeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  },

  data(stringISO) {
    return new Date(stringISO).toLocaleDateString("pt-BR");
  },

  categoria(cat) {
    const mapa = { mouse: "Mouse", teclado: "Teclado", headset: "Headset" };
    return mapa[cat] || cat;
  },
};

// ============================================================
// DOM — helpers para mostrar estados
// ============================================================
const dom = {

  mostrarCarregando(idContainer, mensagem) {
    mensagem = mensagem || "Carregando...";
    const el = document.getElementById(idContainer);
    if (el) {
      el.innerHTML =
        '<div class="loading-overlay">' +
          '<div class="spinner"></div>' +
          '<span>' + mensagem + '</span>' +
        '</div>';
    }
  },

  mostrarVazio(idContainer, icone, titulo, subtitulo) {
    const el = document.getElementById(idContainer);
    if (el) {
      el.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">' + icone + '</div>' +
          '<h4>' + titulo + '</h4>' +
          '<p>' + subtitulo + '</p>' +
        '</div>';
    }
  },
};

// ============================================================
// NAVBAR — gerada dinamicamente em todas as páginas
// ============================================================
function construirNavbar() {
  const usuario = autenticacao.obterUsuario();
  const logado  = autenticacao.estaLogado();

  const html =
    '<nav class="navbar navbar-expand-lg">' +
      '<div class="container">' +

        '<a class="navbar-brand" href="/">' +
          '⌨ <span>PERIFÉRICOS</span>' +
          '<span style="color:var(--cor-texto-suave);font-weight:300">.shop</span>' +
        '</a>' +

        '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#menu-nav">' +
          '<span style="color:var(--cor-texto-secundario);font-size:1.3rem">☰</span>' +
        '</button>' +

        '<div class="collapse navbar-collapse" id="menu-nav">' +

          '<div class="busca-wrapper mx-auto my-2 my-lg-0">' +
            '<span class="icone-busca">🔍</span>' +
            '<input type="text" id="campo-busca" placeholder="Buscar produtos..." autocomplete="off">' +
          '</div>' +

          '<div class="d-flex align-items-center gap-2 ms-lg-3">' +
            (logado
              ? '<a href="/carrinho" class="btn-carrinho text-decoration-none">' +
                  '🛒 Carrinho ' +
                  '<span id="badge-carrinho" style="display:none">0</span>' +
                '</a>' +
                (usuario && usuario.role === "admin"
                  ? '<a href="/admin" class="btn-fantasma">⚙ Admin</a>'
                  : '') +
                '<a href="/pedidos" class="btn-fantasma">📦 Meus Pedidos</a>' +
                '<button onclick="autenticacao.sair()" class="btn-perigo-suave">Sair</button>'
              : '<a href="/login" class="btn-fantasma">Entrar</a>' +
                '<a href="/cadastro" class="btn-destaque">Cadastrar</a>'
            ) +
          '</div>' +

        '</div>' +
      '</div>' +
    '</nav>';

  document.body.insertAdjacentHTML("afterbegin", html);

  // Atualiza badge do carrinho
  carrinho.atualizarBadge();

  // Listener de busca
  const campoBusca = document.getElementById("campo-busca");
  if (campoBusca) {
    campoBusca.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        const termo = campoBusca.value.trim();
        if (termo) {
          window.location.href = "/?busca=" + encodeURIComponent(termo);
        }
      }
    });
  }
}
