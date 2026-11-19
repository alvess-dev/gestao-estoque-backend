import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (ordem importa por causa das FKs)
  await prisma.movimentacoes.deleteMany();
  await prisma.produtos.deleteMany();
  await prisma.categorias.deleteMany();
  await prisma.usuarios.deleteMany();

  console.log('🗑️  Dados antigos removidos');

  // ===== CRIAR USUÁRIOS =====
  const senhaHash = await bcrypt.hash('admin123', 10);

  await prisma.usuarios.createMany({
    data: [
      { nome: 'Administrador', email: 'admin@gmail.com', senha_hash: senhaHash },
    ],
  });

  const users = await prisma.usuarios.findMany();
  console.log(`👥 ${users.length} usuário criado`);

  // ===== CRIAR CATEGORIAS =====
  await prisma.categorias.createMany({
    data: [
      { nome: 'Eletrônicos' },
      { nome: 'Informática' },
      { nome: 'Periféricos' },
      { nome: 'Componentes' },
      { nome: 'Acessórios' },
      { nome: 'Cabos e Adaptadores' },
      { nome: 'Armazenamento' },
      { nome: 'Redes' },
    ],
  });

  const cats = await prisma.categorias.findMany();
  console.log(`📦 ${cats.length} categorias criadas`);

  // ===== CRIAR PRODUTOS (com quantidade 0 inicial) =====
  const produtosBase = [
    // Eletrônicos
    { nome: 'Smartphone Samsung Galaxy S24', descricao: 'Smartphone topo de linha 256GB', preco: 4299.90, quantidadeInicial: 15, categoria_id: cats[0].id },
    { nome: 'iPhone 15 Pro Max', descricao: 'Apple iPhone 15 Pro Max 256GB Titânio', preco: 7899.00, quantidadeInicial: 8, categoria_id: cats[0].id },
    { nome: 'Smart TV LG 55" OLED', descricao: 'TV OLED 4K 55 polegadas', preco: 3499.00, quantidadeInicial: 12, categoria_id: cats[0].id },
    { nome: 'Fone JBL Tune 510BT', descricao: 'Headphone Bluetooth com 40h bateria', preco: 249.90, quantidadeInicial: 45, categoria_id: cats[0].id },
    { nome: 'Caixa de Som JBL Charge 5', descricao: 'Speaker Bluetooth à prova d\'água', preco: 599.00, quantidadeInicial: 22, categoria_id: cats[0].id },

    // Informática
    { nome: 'Notebook Dell Inspiron 15', descricao: 'i7 12ª gen, 16GB RAM, 512GB SSD', preco: 4199.00, quantidadeInicial: 10, categoria_id: cats[1].id },
    { nome: 'MacBook Air M2', descricao: 'Apple M2, 8GB RAM, 256GB SSD', preco: 6499.00, quantidadeInicial: 6, categoria_id: cats[1].id },
    { nome: 'Monitor Dell 27" 144Hz', descricao: 'Monitor gamer IPS 27 polegadas', preco: 1299.00, quantidadeInicial: 18, categoria_id: cats[1].id },
    { nome: 'Monitor LG UltraWide 29"', descricao: 'Monitor 21:9 IPS HDR', preco: 1499.00, quantidadeInicial: 14, categoria_id: cats[1].id },
    { nome: 'Teclado Mecânico Redragon', descricao: 'Switch Blue, RGB, ABNT2', preco: 289.90, quantidadeInicial: 30, categoria_id: cats[1].id },

    // Periféricos
    { nome: 'Mouse Gamer Logitech G502', descricao: 'Hero 25K, 11 botões programáveis', preco: 349.00, quantidadeInicial: 35, categoria_id: cats[2].id },
    { nome: 'Mouse Razer DeathAdder V3', descricao: 'Sensor 30K DPI, 59g', preco: 429.00, quantidadeInicial: 20, categoria_id: cats[2].id },
    { nome: 'Headset HyperX Cloud II', descricao: 'Surround 7.1, microfone destacável', preco: 499.00, quantidadeInicial: 25, categoria_id: cats[2].id },
    { nome: 'Webcam Logitech C920', descricao: 'Full HD 1080p 30fps', preco: 389.00, quantidadeInicial: 28, categoria_id: cats[2].id },
    { nome: 'Microfone Blue Yeti Nano', descricao: 'USB, padrões cardioide/omni', preco: 549.00, quantidadeInicial: 12, categoria_id: cats[2].id },

    // Componentes
    { nome: 'Placa de Vídeo RTX 4070', descricao: 'NVIDIA GeForce RTX 4070 12GB', preco: 3899.00, quantidadeInicial: 5, categoria_id: cats[3].id },
    { nome: 'Placa de Vídeo RX 7800 XT', descricao: 'AMD Radeon RX 7800 XT 16GB', preco: 3299.00, quantidadeInicial: 7, categoria_id: cats[3].id },
    { nome: 'Processador Intel i7-13700K', descricao: '16 núcleos, 5.4GHz turbo', preco: 2199.00, quantidadeInicial: 10, categoria_id: cats[3].id },
    { nome: 'Processador AMD Ryzen 7 7800X3D', descricao: '8 núcleos, 3D V-Cache', preco: 1999.00, quantidadeInicial: 8, categoria_id: cats[3].id },
    { nome: 'Memória RAM 32GB DDR5 6000MHz', descricao: 'Kit 2x16GB Corsair Vengeance', preco: 649.00, quantidadeInicial: 40, categoria_id: cats[3].id },
    { nome: 'SSD NVMe 1TB Samsung 990 Pro', descricao: 'Leitura 7450 MB/s', preco: 549.00, quantidadeInicial: 30, categoria_id: cats[3].id },
    { nome: 'SSD NVMe 2TB WD Black SN850X', descricao: 'Leitura 7300 MB/s', preco: 949.00, quantidadeInicial: 15, categoria_id: cats[3].id },
    { nome: 'Fonte Corsair RM850x 850W', descricao: '80 Plus Gold, Full Modular', preco: 699.00, quantidadeInicial: 12, categoria_id: cats[3].id },
    { nome: 'Gabinete Lian Li O11 Dynamic', descricao: 'Vidro temperado, E-ATX', preco: 749.00, quantidadeInicial: 10, categoria_id: cats[3].id },

    // Acessórios
    { nome: 'Suporte Notebook Aluminum', descricao: 'Ajustável, compatível 10-17"', preco: 129.00, quantidadeInicial: 40, categoria_id: cats[4].id },
    { nome: 'Hub USB-C 7 em 1', descricao: 'HDMI 4K, USB 3.0, SD, PD 100W', preco: 189.00, quantidadeInicial: 50, categoria_id: cats[4].id },
    { nome: 'Carregador GaN 65W', descricao: '2x USB-C, 1x USB-A, bivolt', preco: 149.00, quantidadeInicial: 60, categoria_id: cats[4].id },
    { nome: 'Mousepad Gamer XL 900x400', descricao: 'Base antiderrapante, borda costurada', preco: 79.90, quantidadeInicial: 80, categoria_id: cats[4].id },
    { nome: 'Organizador de Cabos Magnético', descricao: 'Kit 6 peças, silicone', preco: 39.90, quantidadeInicial: 100, categoria_id: cats[4].id },

    // Cabos e Adaptadores
    { nome: 'Cabo HDMI 2.1 3m', descricao: '4K 120Hz, 8K 60Hz, certificado', preco: 89.00, quantidadeInicial: 70, categoria_id: cats[5].id },
    { nome: 'Cabo USB-C para USB-C 2m', descricao: 'PD 100W, 480Mbps, trançado', preco: 49.90, quantidadeInicial: 90, categoria_id: cats[5].id },
    { nome: 'Adaptador USB-C para HDMI/VGA', descricao: '4K 30Hz, plug and play', preco: 69.00, quantidadeInicial: 55, categoria_id: cats[5].id },
    { nome: 'Cabo DisplayPort 1.4 2m', descricao: '8K 60Hz, HDR, travamento', preco: 79.00, quantidadeInicial: 45, categoria_id: cats[5].id },
    { nome: 'Extensor USB 3.0 5m', descricao: 'Ativo, até 5Gbps', preco: 59.00, quantidadeInicial: 30, categoria_id: cats[5].id },

    // Armazenamento
    { nome: 'HD Externo 2TB Seagate', descricao: 'USB 3.0, 2.5", portátil', preco: 429.00, quantidadeInicial: 25, categoria_id: cats[6].id },
    { nome: 'HD Externo 4TB WD My Passport', descricao: 'USB 3.0, criptografia hardware', preco: 699.00, quantidadeInicial: 15, categoria_id: cats[6].id },
    { nome: 'SSD Externo 1TB Samsung T7', descricao: 'USB 3.2 Gen 2, 1050 MB/s', preco: 599.00, quantidadeInicial: 20, categoria_id: cats[6].id },
    { nome: 'SSD Externo 2TB SanDisk Extreme', descricao: 'USB 3.2 Gen 2, 1050 MB/s, IP55', preco: 899.00, quantidadeInicial: 12, categoria_id: cats[6].id },
    { nome: 'Cartão MicroSD 256GB UHS-I', descricao: 'Classe 10, A2, V30, adaptador', preco: 129.00, quantidadeInicial: 60, categoria_id: cats[6].id },
    { nome: 'Cartão MicroSD 512GB UHS-I', descricao: 'Classe 10, A2, V30, adaptador', preco: 249.00, quantidadeInicial: 40, categoria_id: cats[6].id },

    // Redes
    { nome: 'Roteador Wi-Fi 6 AX3000', descricao: 'Dual band, 4 antenas, Mesh', preco: 399.00, quantidadeInicial: 18, categoria_id: cats[7].id },
    { nome: 'Roteador Wi-Fi 6E AXE5400', descricao: 'Tri-band, 6GHz, 8 streams', preco: 799.00, quantidadeInicial: 10, categoria_id: cats[7].id },
    { nome: 'Switch Gigabit 8 Portas', descricao: 'Não gerenciável, PoE+ 4 portas', preco: 249.00, quantidadeInicial: 22, categoria_id: cats[7].id },
    { nome: 'Switch Gigabit 16 Portas', descricao: 'Rackmount, gerenciável L2', preco: 549.00, quantidadeInicial: 8, categoria_id: cats[7].id },
    { nome: 'Access Point Wi-Fi 6', descricao: 'PoE+, teto/parede, Mesh', preco: 449.00, quantidadeInicial: 15, categoria_id: cats[7].id },
    { nome: 'Cabo Rede Cat6 10m', descricao: 'Gigabit, blindado, conectores ouro', preco: 34.90, quantidadeInicial: 100, categoria_id: cats[7].id },
    { nome: 'Cabo Rede Cat6a 20m', descricao: '10 Gigabit, blindado S/FTP', preco: 69.00, quantidadeInicial: 50, categoria_id: cats[7].id },
  ];

  // Criar produtos com quantidade 0
  const produtosData = produtosBase.map(p => ({
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    quantidade: 0,
    categoria_id: p.categoria_id,
  }));

  await prisma.produtos.createMany({ data: produtosData });
  const prods = await prisma.produtos.findMany();
  console.log(`📦 ${prods.length} produtos criados`);

  // Mapear produto por nome para achar quantidadeInicial
  const qtdInicialMap = new Map();
  for (const p of produtosBase) {
    qtdInicialMap.set(p.nome, p.quantidadeInicial);
  }

  // ===== CRIAR MOVIMENTAÇÕES POR PRODUTO (uma a uma para respeitar constraint) =====
  const hoje = new Date();
  const dataInicial = new Date(hoje);
  dataInicial.setDate(dataInicial.getDate() - 60); // 60 dias atrás
  dataInicial.setHours(8, 0, 0, 0);

  const adminUser = users[0]; // Admin como responsável pela entrada inicial

  let totalMovs = 0;
  const tipos = ['ENTRADA', 'SAIDA'];

  for (const produto of prods) {
    const qtdInicial = qtdInicialMap.get(produto.nome) || 0;
    let qtdProduto = qtdInicial;

    // 1. Movimentação inicial de ENTRADA
    if (qtdInicial > 0) {
      await prisma.movimentacoes.create({
        data: {
          produto_id: produto.id,
          tipo: 'ENTRADA',
          quantidade: qtdInicial,
          usuario_id: adminUser.id,
          criado_em: dataInicial,
        },
      });
      totalMovs++;
    }

    // 2. Movimentações aleatórias (5-15 por produto)
    const numMovs = Math.floor(Math.random() * 11) + 5;

    for (let i = 0; i < numMovs; i++) {
      const diasAtras = Math.floor(Math.random() * 59); // 0-58 dias após a entrada inicial
      const data = new Date(dataInicial);
      data.setDate(data.getDate() + 1 + diasAtras);
      data.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

      const usuario = users[Math.floor(Math.random() * users.length)];

      // Decidir tipo baseado no estoque atual
      let tipo;
      if (qtdProduto === 0) {
        tipo = 'ENTRADA';
      } else if (qtdProduto < 5) {
        tipo = Math.random() < 0.7 ? 'ENTRADA' : 'SAIDA';
      } else {
        tipo = tipos[Math.floor(Math.random() * 2)];
      }

      let quantidade;
      if (tipo === 'ENTRADA') {
        quantidade = Math.floor(Math.random() * 50) + 10; // 10-60
        qtdProduto += quantidade;
      } else {
        const maxSaida = Math.min(qtdProduto, 20);
        if (maxSaida <= 0) {
          tipo = 'ENTRADA';
          quantidade = Math.floor(Math.random() * 50) + 10;
          qtdProduto += quantidade;
        } else {
          quantidade = Math.floor(Math.random() * maxSaida) + 1;
          qtdProduto -= quantidade;
        }
      }

      await prisma.movimentacoes.create({
        data: {
          produto_id: produto.id,
          tipo,
          quantidade,
          usuario_id: usuario.id,
          criado_em: data,
        },
      });
      totalMovs++;
    }
  }

  console.log(`🔄 ${totalMovs} movimentações criadas (uma a uma para respeitar constraint)`);

  // ===== ATUALIZAR QUANTIDADES FINAIS =====
  for (const produto of prods) {
    const movs = await prisma.movimentacoes.findMany({
      where: { produto_id: produto.id },
      orderBy: { criado_em: 'asc' },
    });

    let qtdAtual = 0;
    for (const mov of movs) {
      if (mov.tipo === 'ENTRADA') qtdAtual += mov.quantidade;
      else qtdAtual -= mov.quantidade;
    }

    qtdAtual = Math.max(0, qtdAtual);

    await prisma.produtos.update({
      where: { id: produto.id },
      data: { quantidade: qtdAtual },
    });
  }
  console.log('📊 Quantidades dos produtos atualizadas conforme movimentações');

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📋 Resumo:');
  console.log(`   👥 Usuários: ${users.length}`);
  console.log(`   📦 Categorias: ${cats.length}`);
  console.log(`   📦 Produtos: ${prods.length}`);
  console.log(`   🔄 Total movimentações: ${totalMovs}`);
  console.log('\n🔐 Login: admin@gmail.com | Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });