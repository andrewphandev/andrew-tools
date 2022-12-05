import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
// import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import morgan from 'morgan';
import schedule from 'node-schedule';
import { join } from 'path';
// import socketio from 'socket.io';
import * as config from './configs';
import { timeNextRequest } from './constants/leaderboard';
import getLeaderBoardProducer from './producers/getLeaderBoard.producer';
import apiRoute from './routes';
import scheduleList from './services/ScheduleService';
import { internalServerError, pageNotFound } from './utils/errorHandler';
import logger from './utils/logger';
import getLeaderBoardWorker from './workers/getLeaderBoard.worker';

const app = express();
const server = require('http').createServer(app);

mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const corsOptions = {
  origin: config.WEB_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

/**
 * Socket
 */
// const corsSocketOptions = {
//   cors: true,
//   origins: [process.env.REACT_APP_URL],
// };
//
// const io = socketio(server, corsSocketOptions);
//
// io.use(async (socket, next) => {
//   if (socket.handshake.query.token && socket.handshake.query.token) {
//     const decoded = jwt.verify(
//       socket.handshake.query.token,
//       process.env.JWT_SECRET,
//     );
//     // eslint-disable-next-line no-param-reassign
//     socket.userInfo = decoded;
//     next();
//   } else {
//     next(new Error('Authentication error'));
//     logger.log('Socket Authentication error');
//   }
// }).on('connection', async (client) => {
//   setInterval(async () => {
//     const overviewList = await getOverviewDeviceList();
//     const alertData = await getAlertData();
//     client.emit(
//       'getOverviewDeviceList',
//       Crypto.encrypt(JSON.stringify(overviewList)),
//       // overviewList,
//     );
//     client.emit(
//       'getAlertData',
//       Crypto.encrypt(JSON.stringify(alertData)),
//       // alertData,
//     );
//   }, 1 * 60 * 60 * 1000);

//   client.on('error', (err) => {
//     logger.error(err.message);
//   });
//   // client.on('disconnect', () => {
//   //   console.log('disconnected');
//   // });
// });

app.use(helmet());
app.use(helmet.noSniff()); // set X-Content-Type-Options header
app.use(helmet.frameguard()); // set X-Frame-Options header
app.use(helmet.xssFilter()); // set X-XSS-Protection header
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(__dirname, 'public')));
app.use(cors(corsOptions));

// route
app.use('/api', apiRoute);

// error handlers
app.use(pageNotFound);
app.use(internalServerError);

getLeaderBoardWorker.init();

// getLeaderBoardListHistory();
setInterval(async () => {
  await getLeaderBoardProducer.start();
}, timeNextRequest);

// BinanceService.getLeaderBoardItemHistory();
// bot.onText(/\//, async (msg) => {
//   console.log('🚀 ~ file: server.js ~ line 108 ~ bot.onText ~ msg', msg);
//   const ChatID = msg.chat.id || msg.from.id || null;
//   console.log('🚀 ~ file: server.js ~ line 109 ~ bot.onText ~ ChatID', ChatID);
//   bot.sendMessage(ChatID, 'ok');
// });
server.listen(config.PORT, () => {
  logger.info(`Server running on port: ${config.PORT}`);

  scheduleList.forEach((sch) => {
    schedule.scheduleJob(sch.cronFormat, sch.function);
  });
});

process.on('unhandledRejection', (error) => {
  logger.error(`unhandledRejection${error.message}`);
});
