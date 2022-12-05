import express from 'express';
import controller from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth.middleware';

const router = express.Router();

router.get(
  '/get-current-user',
  controller.getCurrentUser,
  // controller.getCurrentUserLocal,
);

router.get(
  '/get-list-tb-admin',
  authMiddleware.requireAuth,
  // authMiddleware.requireAuthLocal,
  controller.getListTbAdmin,
);

export default router;
