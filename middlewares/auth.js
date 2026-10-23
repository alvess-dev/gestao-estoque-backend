
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      erro: 'Faça login para continuar.'
    });
  }

  try {
    const dadosUsuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = dadosUsuario;
    next();
  } catch (error) {
    return res.status(401).json({
      erro: 'Token inválido ou expirado.'
    });
  }
}
