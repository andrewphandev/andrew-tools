import { ALERT_TYPE } from '../constants/enum';
import Alert from '../models/Alert';
import Device from '../models/Device';

// HIGH, MEDIUM, LOW
const getTypeAlert = (value) => {
  if (value > 50 && value <= 75) return ALERT_TYPE.indexOf('LOW');
  if (value > 75 && value <= 100) return ALERT_TYPE.indexOf('MEDIUM');
  if (value > 100) return ALERT_TYPE.indexOf('HIGH');
  return -1;
};

export const setAlertStatus = async (device, RAM, CPU) => {
  const lastAlert = await Alert.findOne({ device: device.id }).sort({
    createdAt: -1,
  });
  if (!lastAlert || lastAlert.value === 'OFFLINE') {
    await Alert.create({
      device: device.id,
      type: 'HIGH',
      key: 'STATUS',
      value: 'ONLINE',
    });
  } else {
    let { type, key, value } = lastAlert;
    const typeRAM = getTypeAlert(RAM);
    const typeCPU = getTypeAlert(CPU);

    if (typeCPU !== -1 && typeRAM !== -1) {
      if (typeCPU >= typeRAM) {
        type = ALERT_TYPE[typeCPU];
        key = 'CPU';
        value = CPU;
      } else {
        type = ALERT_TYPE[typeRAM];
        key = 'RAM';
        value = RAM;
      }

      if (lastAlert.type !== type || lastAlert.key !== key) {
        await Alert.create({
          device: device.id,
          type,
          key,
          value,
        });
      }
    }
  }
};

export const setAlertOffline = async (device) => {
  const lastAlert = await Alert.findOne({ device: device.id }).sort({
    createdAt: -1,
  });
  if (!lastAlert || lastAlert.value !== 'OFFLINE') {
    // console.log('error', device.id, err);
    await Alert.create({
      device: device.id,
      type: 'HIGH',
      key: 'STATUS',
      value: 'OFFLINE',
    });
  }
};

export const getAlertData = async () => {
  try {
    const alertList = await Alert.find()
      .sort({ createdAt: -1 })
      .populate('device', 'type name');
    const criticalAlert = alertList.filter((item) => item.type === 'HIGH');
    const totalDevices = await Device.find().countDocuments();

    return {
      alertList,
      totalDevices,
      criticalAlert: criticalAlert.length,
    };
  } catch (err) {
    return {
      alertList: [],
      totalDevices: 0,
      criticalAlert: 0,
    };
  }
};
