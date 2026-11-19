export class ErroHttp extends Error {
  constructor(mensagem, status = 400, codigo = null) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
    this.codigo = codigo;
  }
}

export function tratarErro(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.status) {
    const payload = { erro: err.message };
    if (err.codigo) payload.codigo = err.codigo;
    return res.status(err.status).json(payload);
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ erro: 'A categoria ou o produto informado não existe.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }

  // erros levantados por procedures do postgresql chegam como p2010
  if (err.code === 'P2010') {
    const detalhe = String(err.meta?.message ?? err.message ?? '').toLowerCase();
    if (detalhe.includes('estoque') || detalhe.includes('quantidade')) {
      return res.status(409).json({ erro: 'A quantidade solicitada não está disponível no estoque.' });
    }
    return res.status(400).json({ erro: 'Não foi possível registrar a movimentação de estoque.' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno.' });
}
