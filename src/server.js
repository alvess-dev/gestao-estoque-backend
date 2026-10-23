import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 
import { autenticar } from './middlewares/auth.js';


const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Permite que o Express entenda JSON enviado pelo Postman
app.use(express.json());

//Usuario ----------------------------------------------------------

app.post('/login', limiteLogin, async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (
      typeof email !== 'string' ||
      typeof senha !== 'string'
    ) {
      return res.status(400).json({
        erro: 'Informe e-mail e senha.',
      });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (
      !usuario ||
      !(await bcrypt.compare(senha, usuario.password))
    ) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.',
      });
    }

    const token = jwt.sign(
      { sub: String(usuario.id) },
      process.env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      mensagem: 'Login realizado com sucesso.',
      usuario: {
        id: usuario.id,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      erro: 'Erro interno ao realizar login.',
    });
  }
});

//verificar sessão

app.get('/auth/me', autenticar, async (req, res) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: Number(req.usuario.id) },
      select: {
        id: true,
        email: true,
        nome: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        erro: 'Usuário não encontrado.',
      });
    }

    res.json({ usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao verificar sessão.',
    });
  }
});

//fazer logout
app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    mensagem: 'Logout realizado com sucesso.',
  });
});


//Categorias ======================================================

app.post('/categorias', async (req, res) => {
  try {
    const novaCategoria = await prisma.categorias.create({
      data: req.body
    });
    res.status(201).json(novaCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar categoria.' });
  }
});

// Produtos ------------------------------------------------------

// mostrar todos

app.get('/produtos', async (req, res) => {
  try {
    const { categoriaId } = req.query;

    // Se categoriaId for informado, filtra pela categoria.
    // Caso contrário, retorna todos os produtos.
    const where = {};

    if (categoriaId !== undefined) {
      const id = Number(categoriaId);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          erro: 'O ID da categoria deve ser um número inteiro positivo.',
        });
      }

      where.categoria_id = id;
    }

    const produtos = await prisma.produtos.findMany({
      where,
      include: {
        categorias: true,
      },
    });

    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      erro: 'Erro ao buscar produtos.',
    });
  }
});

//procurar pelo id

app.get('/produtos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id); 
    const produto = await prisma.produtos.findUnique({
      where: { id: id }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o produto.' });
  }
});

// cadastrar produto 

app.post('/produtos', autenticar, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const novoProduto = await prisma.produtos.create({
      data: req.body
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

//atualizar produto 

app.put('/produtos/:id', autenticar,  async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const id = parseInt(req.params.id);
    const produtoAtualizado = await prisma.produtos.update({
      where: { id: id },
      data: req.body
    });
    res.json(produtoAtualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});


//adicionar quantidade

app.post('/produtos/:id/entrada', autenticar, async (req, res) => {
    const usuarioId = Number(req.usuario.id);
    const id = Number(req.params.id);
    const { quantidade } = req.body;

  try {
    const id = Number(req.params.id);
    const { quantidade } = req.body;

    await prisma.$executeRaw`
      CALL registrar_entrada(${id}, ${quantidade}, ${id_usuario})
    `;
    res.json({ mensagem: 'Entrada registrada!' });
  } catch (error) {
    res.status(400).json({
      erro: 'Erro ao registrar entrada'
    });
  }
});

// tirar quantidade

app.post('/produtos/:id/saida', async (req, res) => {
  const usuarioId = Number(req.usuario.id);
    const id = Number(req.params.id);
    const { quantidade } = req.body;

  try {
    const id = Number(req.params.id);
    const { quantidade } = req.body;

    await prisma.$executeRaw`
      CALL registrar_saida(${id}, ${quantidade})
    `;

    res.json({ mensagem: 'Saída registrada!' });
  } catch (error) {
    res.status(400).json({
      erro: 'Erro ao registrar saída'
    });
  }
});

// excluir produto

app.delete('/produtos/:id', autenticar, async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const id = parseInt(req.params.id);
    const registroDeletado = await prisma.produtos.delete({
      where: { id: id }
    });
    res.json({ mensagem: 'Produto deletado com sucesso!', registroDeletado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto.' });
  }
});


//Servidor --------------------------------------------------------------------

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
