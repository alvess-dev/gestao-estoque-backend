import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import produtosRoutes from './routes/produtos.routes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);                  // /login, /logout, /auth/me
app.use('/categorias', categoriasRoutes);
app.use('/produtos', produtosRoutes);

// rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// tratamento de erros (sempre por último)
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ erro: err.message });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno.' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});