import axios from 'axios';
import FormData from 'form-data';
import status from 'http-status';
import jwt from 'jsonwebtoken';
import { omit } from 'lodash';
import User from '../models/User';
import { JWT_SECRET } from '../configs';
import authMessages from '../locales/en-US/auth';
import { responseError, responseSuccess } from '../services/Response';

const loginLocal = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.json(responseError({ message: authMessages.LOGIN_FAIL }));
  }
  user.comparePassword(password, async (err, isMatch) => {
    if (!isMatch) {
      return res.json(responseError({ message: authMessages.LOGIN_FAIL }));
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });
    const data = {
      // eslint-disable-next-line no-underscore-dangle
      user: omit(user._doc, ['password']),
      token,
      expiresIn: '24h',
    };
    return res.json(responseSuccess({ data }));
  });
};
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const dataForm = new FormData();
    dataForm.append('userName', username);
    dataForm.append('password', password);
    const config = {
      method: 'post',
      url: 'http://10.195.143.161:5000/login',
      headers: dataForm.getHeaders(),
      data: dataForm,
    };

    const response = await axios(config);
    const { data } = response;
    if (data.error) {
      return res.json(responseError({ message: authMessages.LOGIN_FAIL }));
    }

    const { fullname, title, sub } = data;
    const userInfo = {
      fullname,
      title,
      sub,
      username: sub,
      role: 'ADMIN',
      avatar: `${req.protocol}://${req.get(
        'host',
      )}/images/avatar_placeholder.png`,
    };
    const token = jwt.sign(userInfo, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.json(
      responseSuccess({
        data: {
          user: userInfo,
          token,
          expiresIn: '24h',
        },
      }),
    );
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
  login,
  loginLocal,
};
