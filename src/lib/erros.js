export class ErroHttp extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.name = 'ErroHttp';
    this.status = status;
  }
}

export function tratarErro(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.status) return res.status(err.status).json({ erro: err.message });

  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados.' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ erro: 'A categoria ou o produto informado não existe.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }

  // Erros levantados por procedures do PostgreSQL chegam como P2010.
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
