import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Permite que o Express entenda JSON enviado pelo Postman
app.use(express.json());

// ==========================================



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

// ==========================================


app.get('/produtos', async (req, res) => {
  try {
    const produtos = await prisma.produtos.findMany();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos.' });
  }
});

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

app.post('/produtos', async (req, res) => {
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

app.put('/produtos/:id', async (req, res) => {
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

app.delete('/produtos/:id', async (req, res) => {
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

// ==========================================
// ⚙️ INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ativo e pronto para o Postman em http://localhost:${PORT}`);
});
