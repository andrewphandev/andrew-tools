import amqp from 'amqplib';
import * as config from '../configs';
import BinanceService from '../services/BinanceService';
import CHANNEL from '../constants/channel';

const amqpServerURL = config.AMQP_HOST;
const queueName = CHANNEL.CHANNEL_GET_LEADERBOARD;

module.exports.init = async () => {
  console.log(`[${queueName}] queue worker is running`);
  try {
    const connection = await amqp.connect(amqpServerURL);
    const channel = await connection.createChannel();

    await channel.assertQueue(`${queueName}`, { durable: true });

    channel.prefetch(1);
    channel.consume(
      `${queueName}`,
      async (message) => {
        // const jobData = JSON.parse(message.content.toString());
        console.log('[Start] - GET LEADER BOARD');
        // await convertBCService.convertIKOBToKOB(
        //   jobData.publicAddress,
        //   jobData.kobReceived,
        //   jobData.historyConvert,
        //   jobData.userId,
        // );
        await BinanceService.getLeaderBoardItemHistory();
        console.log('[End] - GET LEADER BOARD');
        channel.ack(message);
      },
      { noAck: false },
    );
  } catch (error) {
    console.error(error);
  }
};
