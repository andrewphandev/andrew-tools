import axios from 'axios';
import logger from '../utils/logger';
import { healthCheck, getDailyInformation } from './SSHService';

const scheduleList = [
  // {
  //   // 23h 53' every day
  //   cronFormat: '0 53 23 * * 0-6',
  //   // cronFormat: '0 0 */1 * * *',
  //   function: getDailyInformation,
  // },
  // {
  //   // cronFormat: '0-59/5 * * * * *',
  //   // every hours
  //   cronFormat: '0 0 */1 * * *',
  //   function: healthCheck,
  // // },
  // {
  //   // cronFormat: '0-59/5 * * * * *',
  //   // every hours
  //   cronFormat: '*/1 * * * * *',
  //   function: async () => {
  //     try {
  //       const response = await axios.post(
  //         'https://www.binance.com/bapi/futures/v1/public/future/leaderboard/getOtherPosition',
  //         {
  //           encryptedUid: 'D64DDD2177FA081E3F361F70C703A562',
  //           tradeType: 'PERPETUAL',
  //         },
  //       );

  //       const { data } = response;
  //       console.log("🚀 ~ file: ScheduleService.js ~ line 33 ~ function: ~ data", data)
  //     } catch (err) {
  //       logger.log('error', err);
  //       console.log('error', err);
  //     }
  //   },
  // },
];
export default scheduleList;
