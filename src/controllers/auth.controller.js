import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ErroHttp } from '../lib/erros.js';

const TOKEN_MAX_AGE = 8 * 60 * 60 * 1000;

function opcoesCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

function dadosPublicos(usuario) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = req.body?.senha;
  if (!email || typeof senha !== 'string' || !senha) {
    throw new ErroHttp('Informe o e-mail e a senha.', 400);
  }

  const usuario = await prisma.usuarios.findUnique({ where: { email } });
  const senhaValida = usuario && await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) throw new ErroHttp('E-mail ou senha inválidos.', 401);
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não configurado.');

  const token = jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(usuario.id),
    expiresIn: '8h',
  });
  return res.cookie('token', token, { ...opcoesCookie(), maxAge: TOKEN_MAX_AGE })
    .json({ usuario: dadosPublicos(usuario) });
}

export async function me(req, res) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: req.usuario.id },
    select: { id: true, nome: true, email: true },
  });
  if (!usuario) throw new ErroHttp('Usuário não encontrado.', 404);
  return res.json({ usuario });
}

export function logout(req, res) {
  return res.clearCookie('token', opcoesCookie()).json({ mensagem: 'Sessão encerrada.' });
}
