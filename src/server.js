import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken'; 
import { autenticar } from './middlewares/auth.js';


const app = express();
const prisma = new PrismaClient();

// Permite que o Express entenda JSON enviado pelo Postman
app.use(express.json());

//Usuario ----------------------------------------------------------

app.post('/usuarios', async (req, res) => {
  try {
    const novoUser = await prisma.usuarios.create({
      data: req.body
    });
    res.status(201).json(novoUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar usuario.' });
  }
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
    const produtos = await prisma.produtos.findMany();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
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
    const usuarioId = req.usuario.id;

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
  const usuarioId = req.usuario.id;

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
