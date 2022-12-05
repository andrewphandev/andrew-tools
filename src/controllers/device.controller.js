import status from 'http-status';
import { NodeSSH } from 'node-ssh';
import { DEVICE_TYPE } from '../constants/enum';
import dailyDeviceHistoryMessages from '../locales/en-US/dailyDeviceHistory';
import deviceMessages from '../locales/en-US/device';
import Device from '../models/Device';
import { getAlertData, setAlertStatus } from '../services/AlertService';
import {
  getDailyDeviceHistory as getDailyDeviceHistoryService,
  getDailyDeviceHistoryByDevice,
  getOverviewDeviceList,
} from '../services/DeviceService';
import { responseError, responseSuccess } from '../services/Response';
import User from '../models/User';

const addDevice = async (req, res) => {
  try {
    const { ipAddress, username, password } = req.body;
    const checkIP = await Device.findOne({ ipAddress });
    if (checkIP) {
      return res.json(
        responseError({
          message: deviceMessages.IP_ADDRESS_IS_ALREADY_IN_USE,
        }),
      );
    }
    const ssh = new NodeSSH();
    ssh
      .connect({
        host: ipAddress,
        username,
        password,
        tryKeyboard: true,
        onKeyboardInteractive(
          name,
          instructions,
          instructionsLang,
          prompts,
          finish,
        ) {
          if (
            // eslint-disable-next-line operator-linebreak
            prompts.length > 0 &&
            prompts[0].prompt.toLowerCase().includes('password')
          ) {
            finish([password]);
          }
        },
      })
      .then(async () => {
        let owner = await User.findOne({
          role: 'TB-ADMIN',
          username: req.body.owner,
        });

        if (!owner) {
          owner = await User.create({
            username: req.body.owner,
            fullname: req.body.owner,
            title: 'Tester',
            role: 'TB-ADMIN',
            avatar: `${req.protocol}://${req.get(
              'host',
            )}/images/avatar_placeholder.png`,
            password: '12345678@Ab',
          });
        }
        req.body.owner = owner.id;
        req.body.currentStatus = 'ONLINE';

        const device = await Device.create(req.body);
        setAlertStatus(device);

        ssh.execCommand(
          'sudo -S apt-get install sysstat -y; echo ENABLED="true" | sudo tee /etc/default/sysstat; sudo service sysstat restart',
          {
            stdin: `${password}\n`,
          },
        );
        return res.json(
          responseSuccess({
            data: { device },
            message: deviceMessages.ADD_DEVICE_SUCCESSFULLY,
          }),
        );
      })
      // eslint-disable-next-line arrow-body-style
      .catch((err) => {
        console.log('err', err);
        return res.json(
          responseError({
            message: deviceMessages.ADD_DEVICE_FAILED,
          }),
        );
      });
  } catch (error) {
    return res.json(
      responseError({
        message: error.message,
        statusCode: status.INTERNAL_SERVER_ERROR,
      }),
    );
  }
};

const getListDevice = async (req, res) => {
  try {
    const { type, q, field } = req.query;
    if (!DEVICE_TYPE.includes(type)) {
      return res.json(
        responseError({
          message: deviceMessages.DEVICE_TYPE_NOT_EXIST,
        }),
      );
    }

    let aggregate = [];
    const matchOne = {
      $match: {
        type,
      },
    };
    aggregate.push(matchOne);

    const lookup = [
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const project = {
      $project: {
        currentStatus: 1,
        name: 1,
        type: 1,
        ipAddress: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: {
          fullname: 1,
          username: 1,
        },
      },
    };

    const sort = {
      $sort: {
        updatedAt: -1,
      },
    };
    aggregate = [...aggregate, ...lookup, project, sort];

    if (q) {
      let matchTwo = {};
      if (field && field === 'name') {
        matchTwo = {
          $match: {
            name: { $regex: `.*${q}.*`, $options: 'i' },
          },
        };
      } else {
        matchTwo = {
          $match: {
            $or: [
              { name: { $regex: `.*${q}.*`, $options: 'i' } },
              { ipAddress: { $regex: `.*${q}.*`, $options: 'i' } },
              { 'owner.username': { $regex: `.*${q}.*`, $options: 'i' } },
              { currentStatus: { $regex: `.*${q}.*`, $options: 'i' } },
            ],
          },
        };
      }

      aggregate.push(matchTwo);
    }

    const devices = await Device.aggregate(aggregate);

    return res.json(
      responseSuccess({
        data: { devices },
        message: deviceMessages.GET_DEVICE_LIST_SUCCESSFULLY,
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

const checkIpAddress = async (req, res) => {
  try {
    const { ipAddress } = req.body;
    const checkIP = await Device.findOne({ ipAddress });
    if (checkIP) {
      return res.json(
        responseError({
          message: deviceMessages.IP_ADDRESS_IS_ALREADY_IN_USE,
        }),
      );
    }
    return res.json(
      responseSuccess({
        message: deviceMessages.VALID_IP_ADDRESS,
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

const getDailyDeviceHistory = async (req, res) => {
  try {
    const { day = 1, type = ['SERVER'], device } = req.body;
    const dailyDeviceHistory = await getDailyDeviceHistoryService(
      day,
      type,
      device,
    );
    return res.json(
      responseSuccess({
        data: { dailyDeviceHistory },
        message:
          dailyDeviceHistoryMessages.GET_DAILY_DEVICE_HISTORY_LIST_SUCCESSFULLY,
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

const getOverviewList = async (req, res) => {
  try {
    const overviewList = await getOverviewDeviceList();
    return res.json(
      responseSuccess({
        data: { overviewList },
        message: deviceMessages.GET_DEVICE_OVERVIEW_LIST_SUCCESSFULLY,
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

const getAlertList = async (req, res) => {
  try {
    const alertData = await getAlertData();
    return res.json(
      responseSuccess({
        data: { alertData },
        message: deviceMessages.GET_ALERT_LIST_SUCCESSFULLY,
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

const getSpecificChart = async (req, res) => {
  try {
    const { day = 1, type = 'SERVER', device } = req.body;
    const dailyDeviceHistory = await getDailyDeviceHistoryByDevice(
      day,
      type,
      device,
    );
    return res.json(
      responseSuccess({
        data: { dailyDeviceHistory },
        message:
          dailyDeviceHistoryMessages.GET_DAILY_DEVICE_HISTORY_LIST_SUCCESSFULLY,
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
  addDevice,
  getListDevice,
  checkIpAddress,
  getDailyDeviceHistory,
  getOverviewList,
  getAlertList,
  getSpecificChart,
};
