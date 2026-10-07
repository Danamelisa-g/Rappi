import { Router } from 'express';
import { loginController, registerController } from './auth-controller';

const router = Router();

router.post('/auth/register', registerController);
router.post('/auth/login', loginController);

export default router;