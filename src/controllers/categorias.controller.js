import { prisma } from '../lib/prisma.js';
import { ErroHttp } from '../lib/erros.js';

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
