import rateLimit from 'express-rate-limit';

export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15 minutos
  max: 10,                  // no máximo 10 tentativas por IP nessa janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' },
});