import express from 'express';
import controller from '../controllers/auth.controller';
import validator from '../middlewares/validators/auth.validator';

const router = express.Router();

router.post('/login', validator.login, controller.login);
// router.post('/login', validator.login, controller.loginLocal);
// router.post('/logout', middleware.requireAuth, controller.logout);

export default router;
