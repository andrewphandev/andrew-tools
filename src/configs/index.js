/* eslint-disable operator-linebreak */
import dotEnv from 'dotenv';
import { join } from 'path';

const Environment = process.env.NODE_ENV;

if (Environment !== 'production') {
  dotEnv.config({ path: join(__dirname, '../../.example.env') });
} else {
  dotEnv.config();
}

const { env } = process;

export const NODE_ENV = env.NODE_ENV || 'development';

export const PORT = parseInt(process.env.PORT || '8080', 10);

export const HOST_URL = env.HOST_URL || `http://localhost:${PORT}`;

export const WEB_URL = env.WEB_URL || 'http://localhost:3000';

export const JWT_SECRET =
  env.JWT_SECRET ||
  '935606197a4f3200b799479c0fe475a98ab8d04a8da0798bddcdb8487041d0b64846e9f5f0b561623cc1d5febf46f057099ac3d896b973b7f767796151e846b3';

export const ENCRYPT_DATA_SECRET =
  env.ENCRYPT_DATA_SECRET ||
  '8ef01f4d035f3a272d474dd6f0a7c58386c3a9b02f8e4a5db1e45aed453fcca766ff62b236f719407aab8267ef07eb8320b5963658f1e33826b0964a676f73de';

export const MONGO_URI =
  env.MONGO_URI || 'mongodb://localhost:27017/andrew-tool';

// mail
export const EMAIL_USER = env.EMAIL_USER || 'andrewphandev@gmail.com';
export const EMAIL_PASSWORD = env.EMAIL_PASSWORD || '12345678@Ab';

export const BINANCE_API_KEY = env.BINANCE_API_KEY || 'API KEY';
export const BINANCE_SECRET_KEY = env.BINANCE_SECRET_KEY || 'SECRET KEY';

export const TELEGRAM_BOT_TOKEN =
  env.TELEGRAM_BOT_TOKEN || '5436089275:AAGOfbDtSNM184xsK7wZSKhGg3JQvNRrKsk';

export const AMQP_HOST = env.AMQP_HOST || 'amqp://localhost:5672';
