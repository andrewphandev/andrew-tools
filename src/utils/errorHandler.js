/* eslint-disable no-unused-vars */
import createError from 'http-errors';
import status from 'http-status';
import logger from './logger';
import { responseError } from '../services/Response';

const pageNotFound = (_req, _res, next) => {
  next(createError(status.NOT_FOUND, 'Api Not found'));
};

const internalServerError = (error, _req, res, _next) => {
  res.status((error.status && status.OK) || status.INTERNAL_SERVER_ERROR);
  if (res.statusCode === status.INTERNAL_SERVER_ERROR) logger.error(error);
  return res.json(
    responseError({
      statusCode: error.status,
      message: error.message,
    }),
  );
};

export { internalServerError, pageNotFound };
