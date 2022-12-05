import axios from 'axios';
import { isEmpty } from 'lodash';
import Binance from 'node-binance-api';
import LeaderBoard from '../models/LeaderBoard';
import logger from '../utils/logger';
import { generateFutureListMessage } from '../utils/message';
import { bot, chatGroupId } from './TelegramService';

const { BINANCE_API_KEY, BINANCE_SECRET_KEY } = require('../configs');

const binance = new Binance().options({
  APIKEY: BINANCE_API_KEY,
  APISECRET: BINANCE_SECRET_KEY,
  test: true,
});

const getFuturesBalance = async () => {
  const balance = await binance.futuresBalance();
  return balance;
};

const getLeaderBoardListHistory = async () => {
  const leaderBoardList = await LeaderBoard.find();
  console.log('leaderBoardList', leaderBoardList);
};

const getLeaderBoardItemHistory = async (
  encryptedUid = 'D64DDD2177FA081E3F361F70C703A562',
) => {
  try {
    // const order = await binance.futuresMarketBuy('BTCUSDT', 0.002, {
    //   positionSide: TRADE_TYPE.LONG,
    // });
    // console.log('🚀 ~ file: BinanceService.js ~ line 26 ~ order', order);
    // binance.futuresTickerStream('BTCUSDT', console.log);

    // let position_data = await binance.futuresPositionRisk();
    // let markets = Object.keys(position_data);

    // for (let market of markets) {
    //   let obj = position_data[market];
    //   const size = Number(obj.positionAmt);

    //   if (size == 0) continue;
    //   console.info(`20x\t${market}\t${obj.unRealizedProfit}`, obj);
    // }

    const responseLeaderBoard = await axios.post(
      'https://www.binance.com/bapi/futures/v1/public/future/leaderboard/getOtherPosition',
      {
        encryptedUid,
        tradeType: 'PERPETUAL',
      },
    );
    const { data } = responseLeaderBoard;
    const { otherPositionRetList } = data.data;
    const leaderBoard = await LeaderBoard.findOne({ encryptedUid });
    if (!leaderBoard) {
      const responseBaseInfo = await axios.post(
        'https://www.binance.me/bapi/futures/v2/public/future/leaderboard/getOtherLeaderboardBaseInfo',
        {
          encryptedUid,
        },
      );

      const { data: dataBaseInfo } = responseBaseInfo;
      if (dataBaseInfo.data) {
        const { nickName } = dataBaseInfo.data;

        await LeaderBoard.create({
          nickName,
          encryptedUid,
          otherPositionRetList,
        });
      }
    } else {
      // order new future
      const newFutureList = otherPositionRetList.filter((i) => {
        const isNotExist = leaderBoard.otherPositionRetList.every(
          (j) => i.symbol !== j.symbol,
        );
        return isNotExist;
      });

      // endFutureList
      const endFutureList = leaderBoard.otherPositionRetList.filter((i) => {
        const isNotExist = otherPositionRetList.every(
          (j) => i.symbol !== j.symbol,
        );
        return isNotExist;
      });

      // DCA
      const DCAFutureList = otherPositionRetList.filter((i) => {
        const isDCA = leaderBoard.otherPositionRetList.some(
          (j) => i.symbol === j.symbol && i.entryPrice !== j.entryPrice,
        );
        return isDCA;
      });

      if (!isEmpty([...newFutureList, ...endFutureList, ...DCAFutureList])) {
        await bot.sendMessage(
          chatGroupId,
          `
                    ======= User - ${leaderBoard.nickName} =======
                    ID: ${encryptedUid}
${generateFutureListMessage('*** New Entry:', newFutureList)}
${generateFutureListMessage('*** TP/SL::', endFutureList)}
${generateFutureListMessage('*** DCA:', DCAFutureList)}
       `,
        );

        await leaderBoard
          .set({
            otherPositionRetList,
          })
          .save();
      }
    }
  } catch (err) {
    logger.error(err);
    console.log(err, '========= Err ========');
  }
};

export default {
  binance,
  getLeaderBoardItemHistory,
  getLeaderBoardListHistory,
  getFuturesBalance,
};
