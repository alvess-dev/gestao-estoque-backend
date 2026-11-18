import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import * as c from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', autenticar, c.listar);
router.post('/', autenticar, c.criar);
router.put('/:id', autenticar, c.atualizar);
router.delete('/:id', autenticar, c.excluir);

export default router;