import { Router } from 'express';
import { celebrate } from 'celebrate';
import {
  loginUser,
  registerUser,
  refreshUserSession,
  logoutUser,
} from '../controllers/authController.js';
import {
  loginUserSchema,
  registerUserSchema,
  refreshUserSessionSchema,
} from '../validations/authValidation.js';

const router = Router();

router.post('/auth/register', celebrate(registerUserSchema), registerUser);
router.post('/auth/login', celebrate(loginUserSchema), loginUser);
router.post(
  '/auth/refresh',
  celebrate(refreshUserSessionSchema),
  refreshUserSession,
);
router.post('/auth/logout', logoutUser);

export default router;
