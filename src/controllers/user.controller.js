import status from 'http-status';
import userMessages from '../locales/en-US/user';
import User from '../models/User';
import { responseError, responseSuccess } from '../services/Response';

const getCurrentUserLocal = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.json(responseError({ message: userMessages.USER_NOT_FOUND }));
    }
    return res.json(responseSuccess({ data: { user } }));
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const { userInfo } = req;
    return res.json(responseSuccess({ data: { user: userInfo } }));
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

const getListTbAdmin = async (req, res) => {
  try {
    const users = await User.find({ role: 'TB-ADMIN' }).select(
      '_id fullname username',
    );
    return res.json(responseSuccess({ data: { users } }));
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

export default {
  getCurrentUser,
  getCurrentUserLocal,
  getListTbAdmin,
};
