import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from '../configs';

export const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
export const chatGroupId = '-1001610585050'; // Andrew Signals Channel
// export const chatGroupId = '-825598027'; // Andrew Signals
