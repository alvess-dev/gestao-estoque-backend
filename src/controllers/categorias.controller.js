import { prisma } from '../lib/prisma.js';
import { ErroHttp } from '../lib/erros.js';

function idInteiro(valor, nome = 'ID') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroHttp(`${nome} inválido.`);
  return id;
}

export async function listar(req, res) {
  const categorias = await prisma.categorias.findMany({ orderBy: { nome: 'asc' } });
  return res.json(categorias);
}

export async function criar(req, res) {
  const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
  if (!nome) throw new ErroHttp('Informe o nome da categoria.');
  const categoria = await prisma.categorias.create({ data: { nome } });
  return res.status(201).json(categoria);
}

export async function atualizar(req, res) {
  const id = idInteiro(req.params.id, 'Categoria');
  const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
  if (!nome) throw new ErroHttp('Informe o nome da categoria.');
  const categoria = await prisma.categorias.update({
    where: { id },
    data: { nome },
  });
  return res.json(categoria);
}

export async function excluir(req, res) {
  const id = idInteiro(req.params.id, 'Categoria');
  const existente = await prisma.categorias.findUnique({ where: { id }, select: { id: true } });
  if (!existente) throw new ErroHttp('Categoria não encontrada.', 404);
  const produtos = await prisma.produtos.count({ where: { categoria_id: id } });
  if (produtos > 0) throw new ErroHttp('Esta categoria tem produtos vinculados. Remova-os primeiro.', 409);
  await prisma.categorias.delete({ where: { id } });
  return res.status(204).end();
}
