import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import * as c from '../controllers/produtos.controller.js';

const router = Router();

router.get('/', autenticar, c.listar);
router.get('/:id', autenticar, c.buscarPorId);
router.get('/:id/movimentacoes', autenticar, c.listarMovimentacoes);

router.post('/', autenticar, c.criar);
router.put('/:id', autenticar, c.atualizar);
router.delete('/:id', autenticar, c.excluir);

router.post('/:id/entrada', autenticar, c.entrada);
router.post('/:id/saida', autenticar, c.saida);

export default router;
