import express from 'express';
import controller from '../controllers/device.controller';
import validator from '../middlewares/validators/device.validator';

const router = express.Router();

router.post('/add', validator.addDevice, controller.addDevice);
router.get('/get-list', controller.getListDevice);
router.post(
  '/check-ip-address',
  validator.checkIpAddress,
  controller.checkIpAddress,
);
router.post('/get-daily-device-history', controller.getDailyDeviceHistory);
router.post('/get-specific-chart', controller.getSpecificChart);
router.get('/get-overview-list', controller.getOverviewList);
router.get('/get-alert-list', controller.getAlertList);

export default router;
