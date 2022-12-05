import express from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import authRoute from './auth.route';
import deviceRoute from './device.route';
import locationRoute from './location.route';
import userRoute from './user.route';

const router = express.Router();

router.use('/auth', authRoute);
router.use('/users', authMiddleware.requireAuth, userRoute);
router.use('/locations', authMiddleware.requireAuth, locationRoute);
router.use('/devices', authMiddleware.requireAuth, deviceRoute);
// router.use('/users', authMiddleware.requireAuthLocal, userRoute);
// router.use('/locations', authMiddleware.requireAuthLocal, locationRoute);
// router.use('/devices', authMiddleware.requireAuthLocal, deviceRoute);

export default router;
