import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import produtosRoutes from './routes/produtos.routes.js';
import { tratarErro } from './lib/erros.js';

const app = express();
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());

app.use('/', authRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/produtos', produtosRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use(tratarErro);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
