import { prisma } from '../lib/prisma.js';
import { ErroHttp } from '../lib/erros.js';
import { alterarQuantidade, registrarMovimentacao, validarQuantidade } from '../services/estoque.service.js';

const incluirCategoria = { categorias: { select: { id: true, nome: true } } };

function idInteiro(valor, nome = 'ID') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroHttp(`${nome} inválido.`);
  return id;
}

function validarProduto(dados, { criacao = false } = {}) {
  const data = {};
  if (criacao || dados.nome !== undefined) {
    if (typeof dados.nome !== 'string' || !dados.nome.trim()) throw new ErroHttp('Informe o nome do produto.');
    data.nome = dados.nome.trim();
  }
  if (criacao || dados.descricao !== undefined) {
    if (dados.descricao !== undefined && dados.descricao !== null && typeof dados.descricao !== 'string') {
      throw new ErroHttp('A descrição deve ser um texto.');
    }
    data.descricao = dados.descricao?.trim?.() || null;
  }
  if (criacao || dados.preco !== undefined) {
    if (dados.preco === '' || dados.preco === null || dados.preco === undefined) throw new ErroHttp('Informe um preço válido.');
    const preco = Number(dados.preco);
    if (!Number.isFinite(preco) || preco < 0) throw new ErroHttp('O preço deve ser maior ou igual a zero.');
    data.preco = preco;
  }
  if (criacao || dados.categoria_id !== undefined) {
    const categoriaId = dados.categoria_id;
    if (categoriaId === '' || categoriaId === null || categoriaId === undefined) data.categoria_id = null;
    else data.categoria_id = idInteiro(categoriaId, 'Categoria');
  }
  if (criacao || dados.ativo !== undefined) {
    if (dados.ativo !== undefined && typeof dados.ativo !== 'boolean') throw new ErroHttp('O campo ativo deve ser verdadeiro ou falso.');
    data.ativo = dados.ativo ?? true;
  }
  return data;
}

function quantidadeRequisicao(valor, { podeSerZero = false } = {}) {
  const quantidade = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
  validarQuantidade(quantidade, { podeSerZero });
  return quantidade;
}

export async function listar(req, res) {
  const where = {};
  if (req.query.categoriaId !== undefined) where.categoria_id = idInteiro(req.query.categoriaId, 'Categoria');
  if (req.query.ativo !== undefined) {
    if (!['true', 'false'].includes(req.query.ativo)) throw new ErroHttp('O filtro ativo deve ser true ou false.');
    where.ativo = req.query.ativo === 'true';
  }
  const produtos = await prisma.produtos.findMany({ where, include: incluirCategoria, orderBy: { nome: 'asc' } });
  return res.json(produtos);
}

export async function buscarPorId(req, res) {
  const id = idInteiro(req.params.id, 'Produto');
  const produto = await prisma.produtos.findUnique({ where: { id }, include: incluirCategoria });
  if (!produto) throw new ErroHttp('Produto não encontrado.', 404);
  return res.json(produto);
}

export async function criar(req, res) {
  const dados = validarProduto(req.body ?? {}, { criacao: true });
  const quantidade = quantidadeRequisicao(req.body?.quantidade ?? 0, { podeSerZero: true });
  const produto = await prisma.$transaction(async (tx) => {
    const criado = await tx.produtos.create({ data: { ...dados, quantidade: 0 } });
    if (quantidade > 0) await registrarMovimentacao(tx, 'entrada', criado.id, quantidade, req.usuario.id);
    return tx.produtos.findUnique({ where: { id: criado.id }, include: incluirCategoria });
  });
  return res.status(201).json(produto);
}

export async function atualizar(req, res) {
  const id = idInteiro(req.params.id, 'Produto');
  const dados = validarProduto(req.body ?? {});
  const temQuantidade = Object.hasOwn(req.body ?? {}, 'quantidade');
  const quantidade = temQuantidade
    ? quantidadeRequisicao(req.body.quantidade, { podeSerZero: true })
    : undefined;

  const produto = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM public.produtos WHERE id = ${id} FOR UPDATE`;
    const atual = await tx.produtos.findUnique({ where: { id } });
    if (!atual) throw new ErroHttp('Produto não encontrado.', 404);
    if (Object.keys(dados).length > 0) await tx.produtos.update({ where: { id }, data: dados });
    if (temQuantidade) await alterarQuantidade(tx, atual, quantidade, req.usuario.id);
    return tx.produtos.findUnique({ where: { id }, include: incluirCategoria });
  });
  return res.json(produto);
}

export async function excluir(req, res) {
  const id = idInteiro(req.params.id, 'Produto');
  const existente = await prisma.produtos.findUnique({ where: { id }, select: { id: true } });
  if (!existente) throw new ErroHttp('Produto não encontrado.', 404);
  const movimentos = await prisma.movimentacoes.count({ where: { produto_id: id } });
  if (movimentos > 0) throw new ErroHttp('Este produto tem movimentações registradas. Desative-o pela edição para preservar o histórico.', 409);
  await prisma.produtos.delete({ where: { id } });
  return res.status(204).end();
}

async function movimentar(req, res, tipo) {
  const id = idInteiro(req.params.id, 'Produto');
  const quantidade = quantidadeRequisicao(req.body?.quantidade);
  const produto = await prisma.$transaction(async (tx) => {
    const existente = await tx.produtos.findUnique({ where: { id } });
    if (!existente) throw new ErroHttp('Produto não encontrado.', 404);
    if (tipo === 'saida' && quantidade > existente.quantidade) {
      throw new ErroHttp('A quantidade de saída não pode ser maior que o estoque disponível.', 409);
    }
    await registrarMovimentacao(tx, tipo, id, quantidade, req.usuario.id);
    return tx.produtos.findUnique({ where: { id }, include: incluirCategoria });
  });
  return res.json(produto);
}

export async function entrada(req, res) {
  return movimentar(req, res, 'entrada');
}

export async function saida(req, res) {
  return movimentar(req, res, 'saida');
}

export async function listarMovimentacoes(req, res) {
  const produtoId = idInteiro(req.params.id, 'Produto');
  const produto = await prisma.produtos.findUnique({ where: { id: produtoId }, select: { id: true } });
  if (!produto) throw new ErroHttp('Produto não encontrado.', 404);
  const movimentacoes = await prisma.movimentacoes.findMany({
    where: { produto_id: produtoId },
    include: { usuarios: { select: { id: true, nome: true } } },
    orderBy: { criado_em: 'desc' },
  });
  return res.json(movimentacoes);
}
