import moment from 'moment';
import { NodeSSH } from 'node-ssh';
import ping from 'ping';
import Device from '../models/Device';
import logger from '../utils/logger';
import { setAlertOffline, setAlertStatus } from './AlertService';
import { setDailyDeviceHistory } from './DeviceService';
import MailService from './MailService';

const formatNumber = (number) => Number(parseFloat(number).toFixed(2));

const getResourceInfo = (data) => {
  const CPU = data.match(/([0-9.]+[ +]us,)/g)[0];
  const usedRAM = parseInt(
    data.match(/([0-9.]+[ +]used)/g)[0].replace('+', 9),
    10,
  );
  const totalRAM = parseInt(
    data.match(/([0-9.]+[ +]total)/g)[0].replace('+', 9),
    10,
  );

  return {
    status: 'ONLINE',
    CPU: formatNumber(CPU),
    RAM: formatNumber((usedRAM / totalRAM) * 100),
  };
};

const getDailyResource = (data) => {
  const CPU = data.match(/([0-9.]+CPU)/g)[0];
  const RAM = data.match(/([0-9.]+RAM)/g)[0];

  return {
    status: 'ONLINE',
    CPU: formatNumber(CPU),
    RAM: formatNumber(RAM),
  };
};

export const getDailyInformation = async () => {
  const devices = await Device.find();
  devices.forEach(async (device) => {
    const ssh = new NodeSSH();
    ssh
      .connect({
        host: device.ipAddress,
        username: device.username,
        password: device.originalPassword(),
        tryKeyboard: true,
        onKeyboardInteractive(
          name,
          instructions,
          instructionsLang,
          prompts,
          finish,
        ) {
          if (
            // eslint-disable-next-line operator-linebreak
            prompts.length > 0 &&
            prompts[0].prompt.toLowerCase().includes('password')
          ) {
            finish([device.originalPassword()]);
          }
        },
      })
      .then(async () => {
        let data = null;
        let result = await ssh.execCommand(
          'sar -u | tail -1 | awk \'{print $3 "CPU"}\';   sar -r | tail -1 | awk \'{print $4 "RAM"}\'',
        );

        let { stdout } = result;
        if (stdout) {
          data = getDailyResource(stdout);
        } else {
          result = await ssh.execCommand('top -bn1 | head -4 | tail -2');
          if (!result.stdout) {
            result = await ssh.execCommand(
              // eslint-disable-next-line quotes
              "vsish -e get $(printf 'power/pcpu/%sperf ' $(vsish -e ls power/pcpu)) | awk '/current/ {cpus+=1;total+=$6} END {print total/cpus \" us,\"}'; vsish -e get /memory/comprehensive | sed 's/:/ /' | awk ' /Phys/ { phys = $(NF-1) } /Free/ { free = $(NF-1) } END { print phys \" total\", phys-free \" used\" }'",
            );
            stdout = result.stdout;
          }
          data = getResourceInfo(stdout);
        }

        const { status, CPU, RAM } = data;
        await setAlertStatus(device, RAM, CPU);
        await device.set({ currentStatus: status, CPU, RAM }).save();
        await setDailyDeviceHistory(device);
      })
      .catch(async (err) => {
        logger.error(err.message);
        await setAlertOffline(device);
        if (device.currentStatus !== 'OFFLINE') {
          await device.set({ currentStatus: 'OFFLINE', CPU: 0, RAM: 0 }).save();
        }
        await setDailyDeviceHistory(device);
      });
  });
};

export const healthCheck = async () => {
  const devices = await Device.find().populate('owner', 'fullname username');
  devices.forEach(async (device) => {
    let pingResult = await ping.promise.probe(device.ipAddress);
    let { alive } = pingResult;
    /**
     * ping again
     */
    if (!alive) {
      pingResult = await ping.promise.probe(device.ipAddress);
      alive = pingResult.alive;
    }
    // if device is offline
    if (!alive) {
      await setAlertOffline(device); // set alert
      if (device.currentStatus !== 'OFFLINE') {
        await setAlertOffline(device);
        await device.set({ currentStatus: 'OFFLINE', CPU: 0, RAM: 0 }).save(); // change current status
      }

      /**
       * check time offline and send mail
       */
      const duration = moment.duration(moment().diff(moment(device.updatedAt)));
      const hours = duration.asHours();
      if (hours >= 24 && hours <= 25) {
        MailService.sendMail(
          `${device.owner.username}@cisco.com`,
          'Systembed controller warning',
          `The device ${device.ipAddress} of ${device.owner.fullname} is not used`,
          ['tanphan6061@gmail.com'],
        );
      }
    } else if (device.currentStatus !== 'ONLINE') {
      // is online
      await setAlertStatus(device);
      await device.set({ currentStatus: 'ONLINE' }).save();
    }
  });
};

// // eslint-disable-next-line import/prefer-default-export
// export const getAllDevices = async () => {
//   const devices = await Device.find();
//   devices.forEach(async (device) => {
//     const ssh = new NodeSSH();
//     ssh
//       .connect({
//         host: device.ipAddress,
//         username: device.username,
//         password: device.originalPassword(),
//         tryKeyboard: true,
//         onKeyboardInteractive(
//           name,
//           instructions,
//           instructionsLang,
//           prompts,
//           finish,
//         ) {
//           if (
//             // eslint-disable-next-line operator-linebreak
//             prompts.length > 0 &&
//             prompts[0].prompt.toLowerCase().includes('password')
//           ) {
//             finish([device.originalPassword()]);
//           }
//         },
//       })
//       .then(() => {
//         ssh
//           .execCommand('top -bn1 | head -4 | tail -2')
//           .then(async (result) => {
//             let { stdout } = result;
//             if (!result.stdout) {
//               const result2 = await ssh.execCommand(
//                 // eslint-disable-next-line quotes
//                 "vsish -e get $(printf 'power/pcpu/%sperf ' $(vsish -e ls power/pcpu)) | awk '/current/ {cpus+=1;total+=$6} END {print total/cpus \" us,\"}'; vsish -e get /memory/comprehensive | sed 's/:/ /' | awk ' /Phys/ { phys = $(NF-1) } /Free/ { free = $(NF-1) } END { print phys \" total\", phys-free \" used\" }'",
//               );
//               stdout = result2.stdout;
//             }
//             const { status, CPU, RAM } = getResourceInfo(stdout);
//             await setAlertStatus(device, RAM, CPU);
//             await device.set({ currentStatus: status, CPU, RAM }).save();
//             await setDailyDeviceHistory(device);
//           })
//           .catch((err) => {
//             logger.error(err.message);
//             console.log(err.message);
//           });
//       })
//       .catch(async () => {
//         await setAlertOffline(device);
//         if (device.currentStatus !== 'OFFLINE') {
//           await device.set({ currentStatus: 'OFFLINE', CPU: 0, RAM: 0 }).save();
//         }
//         await setDailyDeviceHistory(device);
//       });
//   });
// };
