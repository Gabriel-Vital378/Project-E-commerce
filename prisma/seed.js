const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // ── Usuários ──
  const senhaAdmin   = await bcrypt.hash("admin123", 10);
  const senhaCliente = await bcrypt.hash("cliente123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@perifericos.com" },
    update: {},
    create: { name: "Administrador", email: "admin@perifericos.com", password: senhaAdmin, role: "admin" },
  });

  const cliente = await prisma.user.upsert({
    where: { email: "cliente@email.com" },
    update: {},
    create: { name: "Cliente Teste", email: "cliente@email.com", password: senhaCliente, role: "client" },
  });

  console.log("✅ Usuários criados");

  // ── Produtos ──
  await prisma.product.deleteMany({});

  const produtos = [
    { name: "Mouse Logitech G502 X Plus", description: "Mouse gamer sem fio com sensor HERO 25K, 25.600 DPI, 13 botões programáveis e iluminação LIGHTFORCE híbrida.", price: 549.9, category: "mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", stock: 15 },
    { name: "Mouse Razer DeathAdder V3", description: "Mouse gamer ergonômico com sensor Focus Pro 30K, 30.000 DPI e switches ópticos de 2ª geração.", price: 449.9, category: "mouse", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", stock: 20 },
    { name: "Mouse SteelSeries Rival 600", description: "Mouse gamer com sistema de peso personalizável, sensor TrueMove3+ e iluminação RGB lateral.", price: 289.9, category: "mouse", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", stock: 10 },
    { name: "Mouse HyperX Pulsefire Haste 2", description: "Mouse ultra-leve com design honeycomb, sensor de 26.000 DPI e cabo USB-C trançado flexível.", price: 199.9, category: "mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", stock: 25 },
    { name: "Teclado Keychron Q1 Pro", description: "Teclado mecânico sem fio 75%, switches Gateron G Pro, construção em alumínio e suporte QMK/VIA.", price: 899.9, category: "teclado", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400", stock: 8 },
    { name: "Teclado Corsair K100 RGB", description: "Teclado mecânico full-size com switches OPX óptico, roda de controle multimídia e iluminação AXON.", price: 1099.9, category: "teclado", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", stock: 5 },
    { name: "Teclado Redragon K552 Kumara", description: "Teclado mecânico compacto TKL, switches Red, retroiluminação vermelha e construção metálica resistente.", price: 159.9, category: "teclado", image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400", stock: 30 },
    { name: "Teclado ASUS ROG Strix Scope RX", description: "Teclado mecânico com switches ROG RX Red ópticos, apoio de pulso magnético e iluminação Aura Sync.", price: 679.9, category: "teclado", image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400", stock: 12 },
    { name: "Headset SteelSeries Arctis Nova Pro", description: "Headset premium com cancelamento de ruído ativo, DAC Hi-Fi integrado e bateria hot-swap para uso contínuo.", price: 1299.9, category: "headset", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", stock: 6 },
    { name: "Headset HyperX Cloud Alpha", description: "Headset com drivers duplos de câmara, microfone destacável com cancelamento de ruído e construção em alumínio.", price: 399.9, category: "headset", image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", stock: 18 },
    { name: "Headset Logitech G733 Lightspeed", description: "Headset sem fio com LIGHTSPEED, iluminação RGB frontal, microfone Blue VO!CE e bateria de 29 horas.", price: 649.9, category: "headset", image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=400", stock: 10 },
    { name: "Headset Razer BlackShark V2", description: "Headset com drivers TriForce Titanium de 50mm, microfone SuperCardioid destacável e THX Spatial Audio.", price: 349.9, category: "headset", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", stock: 22 },
  ];

  const produtosCriados = [];
  for (const p of produtos) {
    const criado = await prisma.product.create({ data: p });
    produtosCriados.push(criado);
  }
  console.log(`✅ ${produtosCriados.length} produtos criados`);

  // ── Avaliações fictícias ──
  await prisma.avaliacao.deleteMany({});

  const avaliacoesFicticias = [
    // Mouse Logitech G502
    { produtoId: produtosCriados[0].id, usuarioId: admin.id, nota: 5, titulo: "Melhor mouse que já usei!", texto: "Sensacional! O sensor é preciso demais, o peso customizável faz toda diferença nos jogos de FPS.", nomeAutor: "Rafael M.", ficticia: true },
    { produtoId: produtosCriados[0].id, usuarioId: admin.id, nota: 5, titulo: "Vale cada centavo", texto: "Comprei há 6 meses e continua perfeito. A bateria dura a semana toda sem recarregar.", nomeAutor: "Lucas P.", ficticia: true },
    { produtoId: produtosCriados[0].id, usuarioId: admin.id, nota: 4, titulo: "Muito bom, mas pesado", texto: "Ótimo mouse, mas pra quem prefere leve pode pesar um pouco. Para uso casual é excelente.", nomeAutor: "Fernanda S.", ficticia: true },
    // Mouse Razer
    { produtoId: produtosCriados[1].id, usuarioId: admin.id, nota: 5, titulo: "Perfeito para FPS", texto: "Formato ergonômico incrível, minha mão não cansa mais depois de horas de jogo.", nomeAutor: "Diego A.", ficticia: true },
    { produtoId: produtosCriados[1].id, usuarioId: admin.id, nota: 4, titulo: "Ótimo custo-benefício", texto: "Excelente mouse, sensor top. Só achei o software da Razer um pouco pesado.", nomeAutor: "Camila R.", ficticia: true },
    // Teclado Keychron
    { produtoId: produtosCriados[4].id, usuarioId: admin.id, nota: 5, titulo: "Teclado dos sonhos", texto: "Build quality absurda. O som das teclas é satisfatório demais. Vale o investimento.", nomeAutor: "Thiago B.", ficticia: true },
    { produtoId: produtosCriados[4].id, usuarioId: admin.id, nota: 5, titulo: "Melhor compra do ano", texto: "Uso para programar e jogar. O QMK/VIA deixa você customizar tudo. Simplesmente perfeito.", nomeAutor: "Ana L.", ficticia: true },
    { produtoId: produtosCriados[4].id, usuarioId: admin.id, nota: 4, titulo: "Muito bom", texto: "Excelente qualidade, só o preço que pesa um pouco. Mas entrega o que promete.", nomeAutor: "Pedro C.", ficticia: true },
    // Teclado Redragon
    { produtoId: produtosCriados[6].id, usuarioId: admin.id, nota: 5, titulo: "Custo-benefício imbatível", texto: "Para quem está começando no mundo dos mecânicos, é uma excelente porta de entrada.", nomeAutor: "Mateus F.", ficticia: true },
    { produtoId: produtosCriados[6].id, usuarioId: admin.id, nota: 4, titulo: "Surpreendeu!", texto: "Não esperava tanta qualidade pelo preço. As teclas Red são suaves e silenciosas.", nomeAutor: "Julia V.", ficticia: true },
    // Headset Nova Pro
    { produtoId: produtosCriados[8].id, usuarioId: admin.id, nota: 5, titulo: "O melhor do mercado", texto: "O cancelamento de ruído é surreal. Uso para trabalhar e jogar, som cristalino.", nomeAutor: "Carlos E.", ficticia: true },
    { produtoId: produtosCriados[8].id, usuarioId: admin.id, nota: 5, titulo: "Qualidade premium total", texto: "Confortável para horas de uso. O microfone é excelente para reuniões e chamadas.", nomeAutor: "Isabela M.", ficticia: true },
    // Headset HyperX
    { produtoId: produtosCriados[9].id, usuarioId: admin.id, nota: 5, titulo: "Muito confortável", texto: "Uso por horas seguidas jogando e nunca sinto desconforto. Som muito bom para o preço.", nomeAutor: "Bruno K.", ficticia: true },
    { produtoId: produtosCriados[9].id, usuarioId: admin.id, nota: 4, titulo: "Ótimo headset", texto: "Boa qualidade de som, microfone funciona bem. Perfeito para quem quer qualidade sem gastar muito.", nomeAutor: "Marina O.", ficticia: true },
    // Headset Razer BlackShark
    { produtoId: produtosCriados[11].id, usuarioId: admin.id, nota: 5, titulo: "Som impressionante", texto: "O THX Spatial Audio deixa os jogos muito mais imersivos. Microfone capta a voz muito bem.", nomeAutor: "Victor H.", ficticia: true },
    { produtoId: produtosCriados[11].id, usuarioId: admin.id, nota: 4, titulo: "Recomendo!", texto: "Muito bom para jogos e filmes. Acabamento sólido, parece durável. Chegou antes do prazo.", nomeAutor: "Leticia N.", ficticia: true },
  ];

  for (const av of avaliacoesFicticias) {
    await prisma.avaliacao.create({ data: av });
  }
  console.log(`✅ ${avaliacoesFicticias.length} avaliações fictícias criadas`);

  console.log("\n🎉 Seed concluído!");
  console.log("Admin:   admin@perifericos.com / admin123");
  console.log("Cliente: cliente@email.com / cliente123");
}

main()
  .catch((e) => { console.error("❌ Erro:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
