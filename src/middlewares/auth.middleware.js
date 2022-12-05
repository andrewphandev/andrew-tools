import status from 'http-status';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configs';
import authMessages from '../locales/en-US/auth';
import { responseError } from '../services/Response';

const requireAuthLocal = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let messageError = '';
  try {
    if (!token) {
      messageError = authMessages.NO_TOKEN_PROVIDED;
      throw messageError;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(status.UNAUTHORIZED).json(
      responseError({
        message: messageError || authMessages.INVALID_TOKEN,
        statusCode: status.UNAUTHORIZED,
      }),
    );
  }
};

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let messageError = '';
  try {
    if (!token) {
      messageError = authMessages.NO_TOKEN_PROVIDED;
      throw messageError;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.sub) {
      messageError = authMessages.NO_TOKEN_PROVIDED;
      throw messageError;
    }
    req.userInfo = decoded;
    next();
  } catch (error) {
    return res.status(status.UNAUTHORIZED).json(
      responseError({
        message: messageError || authMessages.INVALID_TOKEN,
        statusCode: status.UNAUTHORIZED,
      }),
    );
  }
};

export default {
  requireAuth,
  requireAuthLocal,
};
