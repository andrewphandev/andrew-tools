import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

const generateFutureItemMessage = (item) => {
  const date = dayjs(item.updateTimeStamp).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss DD/MM/YYYY')
  const str = `- Symbol: ${item.symbol}
  + Entry Price: ${item.entryPrice}
  + Mark Price: ${item.markPrice}
  + Amount: ${item.amount}
  + PNL: ${item.pnl}$
  + Time: ${date}
  `;
  return str;
};

export const generateFutureListMessage = (title, futureList) => {
  const result = futureList.length
    ? `
  ${title}
  ${futureList.map((item) => generateFutureItemMessage(item)).join(`
  `)}
  `
    : '';
  return result;
};
