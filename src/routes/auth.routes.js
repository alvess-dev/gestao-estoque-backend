import { Router } from 'express';
import { autenticar } from '../middlewares/auth.js';
import { limiteLogin } from '../middlewares/limiteLogin.js';
import * as c from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', limiteLogin, c.login);
router.get('/auth/me', autenticar, c.me);
router.post('/logout', c.logout);

export default router;