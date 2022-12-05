import express from 'express';
import controller from '../controllers/location.controller';
import validator from '../middlewares/validators/location.validator';

const router = express.Router();

router.post('/add', validator.addLocation, controller.addLocation);
router.get('/get-list', controller.getListLocation);

export default router;
