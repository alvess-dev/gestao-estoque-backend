import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { autenticar } from '../middlewares/auth.js';
import * as c from '../controllers/produtos.controller.js';
import { ErroHttp } from '../lib/erros.js';

const router = Router();
const uploadImagem = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 20 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new ErroHttp('Envie uma imagem JPEG, PNG ou WebP.'));
      return;
    }
    callback(null, true);
  },
});
const limitarRemocaoDeFundo = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Limite de remoção de fundo atingido. Tente novamente mais tarde.' },
});

router.get('/', autenticar, c.listar);
router.get('/:id', autenticar, c.buscarPorId);
router.get('/:id/movimentacoes', autenticar, c.listarMovimentacoes);

router.post('/', autenticar, c.criar);
router.post('/remover-fundo', autenticar, limitarRemocaoDeFundo, uploadImagem.single('imagem'), c.removerFundoImagem);
router.put('/:id', autenticar, c.atualizar);
router.delete('/:id', autenticar, c.excluir);

router.post('/:id/entrada', autenticar, c.entrada);
router.post('/:id/saida', autenticar, c.saida);

export default router;
