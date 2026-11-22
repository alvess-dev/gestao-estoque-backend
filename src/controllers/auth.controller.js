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
    .json({ token, usuario: dadosPublicos(usuario) });
}

export async function me(req, res) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: req.usuario.id },
    select: { id: true, nome: true, email: true },
  });
  if (!usuario) throw new ErroHttp('Usuário não encontrado.', 404);
  return res.json({ usuario });
}

export async function alterarSenha(req, res) {
  const senhaAtual = req.body?.senhaAtual;
  const novaSenha = req.body?.novaSenha;
  if (typeof senhaAtual !== 'string' || !senhaAtual || typeof novaSenha !== 'string' || !novaSenha) {
    throw new ErroHttp('Informe a senha atual e a nova senha.', 400, 'PASSWORD_FIELDS_REQUIRED');
  }
  if (novaSenha.length < 8) {
    throw new ErroHttp('A nova senha deve ter pelo menos 8 caracteres.', 400, 'PASSWORD_TOO_SHORT');
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { id: req.usuario.id },
    select: { id: true, senha_hash: true },
  });
  if (!usuario) throw new ErroHttp('Usuário não encontrado.', 404);

  if (!await bcrypt.compare(senhaAtual, usuario.senha_hash)) {
    throw new ErroHttp('A senha atual está incorreta.', 400, 'CURRENT_PASSWORD_INVALID');
  }
  if (await bcrypt.compare(novaSenha, usuario.senha_hash)) {
    throw new ErroHttp('A nova senha deve ser diferente da senha atual.', 400, 'PASSWORD_UNCHANGED');
  }

  const senha_hash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuarios.update({
    where: { id: usuario.id },
    data: { senha_hash },
  });

  return res.json({ mensagem: 'Senha alterada com sucesso.' });
}

export function logout(req, res) {
  return res.clearCookie('token', opcoesCookie()).json({ mensagem: 'Sessão encerrada.' });
}
