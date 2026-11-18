import rateLimit from 'express-rate-limit';

export const limiteLogin = rateLimit({
  // janela de 15 minutos
  windowMs: 15 * 60 * 1000,
  // no máximo 10 tentativas por ip nessa janela
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});
