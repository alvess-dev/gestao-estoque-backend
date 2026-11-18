import { ErroHttp } from '../lib/erros.js';

const rotinas = {
  entrada: 'registrar_entrada',
  saida: 'registrar_saida',
};

async function chamarRotina(tx, tipo, produtoId, quantidade, usuarioId) {
  const rotina = rotinas[tipo];
  const assinaturas = await tx.$queryRaw`
    SELECT p.pronargs::int AS quantidade_parametros
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = ${rotina} AND p.prokind = 'p'
  `;
  // Use the overload that records the authenticated user when it exists; otherwise use CALL(id, quantity).
  const temUsuario = assinaturas.some(({ quantidade_parametros }) => quantidade_parametros === 3);
  const temDoisArgumentos = assinaturas.some(({ quantidade_parametros }) => quantidade_parametros === 2);

  if (temUsuario) {
    if (tipo === 'entrada') {
      await tx.$executeRaw`CALL public.registrar_entrada(${produtoId}, ${quantidade}, ${usuarioId})`;
    } else {
      await tx.$executeRaw`CALL public.registrar_saida(${produtoId}, ${quantidade}, ${usuarioId})`;
    }
    return;
  }
  if (!temDoisArgumentos) {
    throw new ErroHttp(`A procedure ${rotina} não está disponível com os parâmetros esperados.`, 500);
  }
  if (tipo === 'entrada') {
    await tx.$executeRaw`CALL public.registrar_entrada(${produtoId}, ${quantidade})`;
  } else {
    await tx.$executeRaw`CALL public.registrar_saida(${produtoId}, ${quantidade})`;
  }
}

export function validarQuantidade(valor, { podeSerZero = false } = {}) {
  if (!Number.isInteger(valor) || valor < (podeSerZero ? 0 : 1)) {
    throw new ErroHttp(podeSerZero
      ? 'A quantidade deve ser um inteiro maior ou igual a zero.'
      : 'A quantidade deve ser um inteiro maior que zero.');
  }
}

export async function registrarMovimentacao(tx, tipo, produtoId, quantidade, usuarioId) {
  validarQuantidade(quantidade);
  await chamarRotina(tx, tipo, produtoId, quantidade, usuarioId);
}

export async function alterarQuantidade(tx, produto, novaQuantidade, usuarioId) {
  validarQuantidade(novaQuantidade, { podeSerZero: true });
  const diferenca = novaQuantidade - produto.quantidade;
  if (diferenca === 0) return;
  await registrarMovimentacao(
    tx,
    diferenca > 0 ? 'entrada' : 'saida',
    produto.id,
    Math.abs(diferenca),
    usuarioId,
  );
}
