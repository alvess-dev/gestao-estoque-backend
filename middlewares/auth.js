
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      erro: 'Autenticação necessária.',
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );

    req.usuario = {
      id: payload.sub,
    };

    next();
  } catch {
    return res.status(401).json({
      erro: 'Sessão inválida ou expirada.',
    });
  }
}
