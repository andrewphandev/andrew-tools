import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const logDir = 'logs'; // directory path you want to set
if (!fs.existsSync(logDir)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.label({ label: 'Andrew-Tools' }),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
    winston.format.printf((info) => {
      const formatTime = dayjs(info.timestamp)
        .tz('Asia/Ho_Chi_Minh')
        .format('HH:mm:ss DD-MM-YYYY');
      return `[${formatTime}][${info.label}]: ${info.message}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
    // new winston.transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    new DailyRotateFile({
      filename: path.join(logDir, '%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      prepend: true,
      json: false,
      maxSize: '20m',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}

export default logger;
