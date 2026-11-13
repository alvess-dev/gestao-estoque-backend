import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import * as c from '../controllers/categorias.controller.js';

const router = Router();

router.get('/', c.listar);
router.post('/', autenticar, c.criar);

export default router;