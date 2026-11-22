import { ErroHttp } from '../lib/erros.js';
import { Produto } from '../models/Produto.js';

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
  const temTresArgumentos = assinaturas.some(({ quantidade_parametros }) => quantidade_parametros === 3);
  const temDoisArgumentos = assinaturas.some(({ quantidade_parametros }) => quantidade_parametros === 2);

  // prioriza a assinatura de três argumentos, pois usuario_id é obrigatório em movimentacoes
  // converte para integer para corresponder à assinatura das procedures do postgres
  if (temTresArgumentos) {
    // assinatura da procedure: (p_produto_id, p_usuario_id, p_quantidade)
    if (tipo === 'entrada') {
      await tx.$executeRaw`CALL public.registrar_entrada(${produtoId}::int, ${usuarioId}::int, ${quantidade}::int)`;
    } else {
      await tx.$executeRaw`CALL public.registrar_saida(${produtoId}::int, ${usuarioId}::int, ${quantidade}::int)`;
    }
    return;
  }
  if (temDoisArgumentos) {
    if (tipo === 'entrada') {
      await tx.$executeRaw`CALL public.registrar_entrada(${produtoId}::int, ${quantidade}::int)`;
    } else {
      await tx.$executeRaw`CALL public.registrar_saida(${produtoId}::int, ${quantidade}::int)`;
    }
    return;
  }
  throw new ErroHttp(`A procedure ${rotina} não está disponível com os parâmetros esperados.`, 500);
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
  const entidade = new Produto(produto);
  const diferenca = novaQuantidade - entidade.quantidade;
  if (diferenca === 0) return;
  if (diferenca > 0) entidade.registrarEntrada(diferenca);
  else entidade.registrarSaida(Math.abs(diferenca));
  await registrarMovimentacao(
    tx,
    diferenca > 0 ? 'entrada' : 'saida',
    produto.id,
    Math.abs(diferenca),
    usuarioId,
  );
}
