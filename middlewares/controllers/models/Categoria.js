import { prisma } from '../prisma.js';
import { Produto } from '../models/Produto.js';

export async function criar(dados) {
  const produto = new Produto(dados);          // valida aqui
  const salvo = await prisma.produtos.create({ data: produto.paraBanco() });
  return Produto.fromDB(salvo);
}

export async function buscarPorId(id) {
  const registro = await prisma.produtos.findUnique({ where: { id } });
  if (!registro) throw new ErroNegocio('Produto não encontrado.', 404);
  return Produto.fromDB(registro);
}

export async function atualizar(id, dados) {
  const produto = await buscarPorId(id);
  if (dados.nome !== undefined) produto.nome = dados.nome;     // setter valida
  if (dados.preco !== undefined) produto.preco = dados.preco;  // setter valida

  const salvo = await prisma.produtos.update({
    where: { id },
    data: produto.paraBanco(),
  });
  return Produto.fromDB(salvo);
}

export async function listar() {
  const registros = await prisma.produtos.findMany();
  return registros.map(Produto.fromDB);
}