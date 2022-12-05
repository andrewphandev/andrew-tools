import amqp from 'amqplib';
import * as config from '../configs';
import CHANNEL from '../constants/channel';

const amqpServerURL = config.AMQP_HOST;
const queueName = CHANNEL.CHANNEL_GET_LEADERBOARD;

module.exports.start = async () => {
  try {
    const connection = await amqp.connect(amqpServerURL);
    const channel = await connection.createChannel();
    const result = await channel.assertQueue(`${queueName}`, { durable: true });
    if (result.messageCount < 1) {
      channel.sendToQueue(`${queueName}`, Buffer.from(JSON.stringify('')), {
        persistent: true,
      });
      console.log(`[${queueName}] sent successfully`);
    }
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(error);
  }
};
