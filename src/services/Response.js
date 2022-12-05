import Crypto from './Crypto';
import logger from '../utils/logger';

const convertResponse = (data) => {
  const convertData = Crypto.encrypt(JSON.stringify(data));
  return convertData;
  // return data;
};

const responseSuccess = ({
  status = 'Success',
  statusCode = 200,
  message = undefined,
  data = undefined,
  total = undefined,
  sum = undefined,
}) => {
  const JSONData = {
    statusCode,
    status,
    message,
    data,
    total,
    sum,
  };
  return convertResponse(JSONData);
};

const responseError = ({
  status,
  statusCode = 400,
  message = undefined,
  data = undefined,
}) => {
  let statusName = status;
  if (!status) {
    switch (statusCode) {
      case 400:
        statusName = 'ValidationError';
        break;
      case 401:
        statusName = 'UNAUTHORIZED';
        break;
      case 404:
        statusName = 'NotFound';
        break;
      default:
        statusName = 'Unknow error';
        logger.error(message);
        break;
    }
  }
  const JSONData = {
    statusCode,
    status: statusName,
    message,
    data,
  };
  return convertResponse(JSONData);
};

export { responseSuccess, responseError };
