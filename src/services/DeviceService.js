/* eslint-disable no-underscore-dangle */
/* eslint-disable object-curly-newline */
import { omit } from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import { DEVICE_KEY_TYPE, DEVICE_TYPE } from '../constants/enum';
import DailyDeviceHistory from '../models/DailyDeviceHistory';
import Device from '../models/Device';

export const getOverviewDeviceList = async () => {
  const aggregate = [];
  const project = {
    $project: {
      type: 1,
      keyType: 1,
      numberOnline: {
        $cond: [
          {
            $eq: ['$currentStatus', 'ONLINE'],
          },
          1,
          0,
        ],
      },
      numberOffline: {
        $cond: [
          {
            $eq: ['$currentStatus', 'OFFLINE'],
          },
          1,
          0,
        ],
      },
    },
  };

  const group = {
    $group: {
      _id: {
        type: '$type',
        keyType: '$keyType',
      },
      online: {
        $sum: '$numberOnline',
      },
      offline: {
        $sum: '$numberOffline',
      },
    },
  };

  aggregate.push(project);
  aggregate.push(group);

  aggregate.push({
    $project: {
      _id: '$_id.type',
      keyType: '$_id.keyType',
      online: 1,
      offline: 1,
    },
  });

  try {
    let devices = await Device.aggregate(aggregate);
    devices = DEVICE_TYPE.map((type) => {
      // eslint-disable-next-line no-underscore-dangle
      const device = devices.find((item) => item._id === type);
      if (device) return device;
      return {
        _id: type,
        keyType: DEVICE_KEY_TYPE.find((i) => type.includes(i)),
        online: 0,
        offline: 0,
      };
    });
    return devices;
  } catch (err) {
    return [];
  }
};

export const getDailyDeviceHistory = async (
  day = 1,
  type = ['SERVER'],
  device,
) => {
  const today = moment().startOf('day');
  const startDay = moment()
    .startOf('day')
    .subtract(day - 1, 'days');

  let aggregate = [];
  const matchOne = {
    $match: {
      date: {
        $gte: new Date(startDay),
        $lte: new Date(today),
      },
    },
  };
  const lookup = [
    {
      $lookup: {
        from: 'devices',
        localField: 'device',
        foreignField: '_id',
        as: 'device',
      },
    },
    {
      $unwind: {
        path: '$device',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  let matchTwo = {};
  if (device) {
    matchTwo = {
      $match: {
        'device._id': Types.ObjectId(device),
      },
    };
  } else {
    matchTwo = {
      $match: {
        'device.type': {
          $in: type,
        },
      },
    };
  }

  const projectOne = {
    $project: {
      date: 1,
      RAM: 1,
      CPU: 1,
      numberOnline: {
        $cond: [
          {
            $eq: ['$status', 'ONLINE'],
          },
          1,
          0,
        ],
      },
      numberOffline: {
        $cond: [
          {
            $eq: ['$status', 'OFFLINE'],
          },
          1,
          0,
        ],
      },
    },
  };
  const group = {
    $group: {
      _id: '$date',
      online: {
        $sum: '$numberOnline',
      },
      offline: {
        $sum: '$numberOffline',
      },
      RAM: {
        $avg: '$RAM',
      },
      CPU: {
        $avg: '$CPU',
      },
    },
  };

  const projectTwo = {
    $project: {
      _id: 0,
      online: 1,
      date: '$_id',
      offline: 1,
      RAM: 1,
      CPU: 1,
    },
  };

  const sort = {
    $sort: {
      date: 1,
    },
  };

  aggregate = [
    matchOne,
    ...lookup,
    matchTwo,
    projectOne,
    group,
    projectTwo,
    sort,
  ];
  const data = await DailyDeviceHistory.aggregate(aggregate);
  if (data.length < 1) {
    return [
      {
        online: 0,
        date: today,
        RAM: 0,
        CPU: 0,
      },
    ];
  }
  return data;
};

export const setDailyDeviceHistory = async (device) => {
  const { id, RAM, CPU, currentStatus: status } = device;
  const today = moment().startOf('day');
  const dailyHistory = await DailyDeviceHistory.findOne({
    date: today,
    device: id,
  });

  if (dailyHistory) {
    await dailyHistory
      .set({
        RAM,
        CPU,
        status,
      })
      .save();
  } else {
    await DailyDeviceHistory.create({
      date: today,
      RAM,
      CPU,
      status,
      device: id,
    });
  }
};

export const getDailyDeviceHistoryByDevice = async (
  day = 1,
  type = 'SERVER',
  device,
) => {
  const today = moment().startOf('day');
  const startDay = moment()
    .startOf('day')
    .subtract(day - 1, 'days');
  let aggregate = [];
  const matchOne = {
    $match: {
      date: {
        $gte: new Date(startDay),
        $lte: new Date(today),
      },
    },
  };
  const lookup = [
    {
      $lookup: {
        from: 'devices',
        localField: 'device',
        foreignField: '_id',
        as: 'device',
      },
    },
    {
      $unwind: {
        path: '$device',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'device.owner',
        foreignField: '_id',
        as: 'device.owner',
      },
    },
    {
      $unwind: {
        path: '$device.owner',
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  let matchTwo = {};
  if (device) {
    matchTwo = {
      $match: {
        'device._id': {
          $in: device.map((i) => Types.ObjectId(i)),
        },
      },
    };
  } else {
    matchTwo = {
      $match: {
        'device.type': type,
      },
    };
  }

  const projectOne = {
    $project: {
      date: 1,
      RAM: 1,
      CPU: 1,
      device: {
        _id: 1,
        name: 1,
        owner: {
          username: 1,
          fullname: 1,
        },
      },
      numberOnline: {
        $cond: [
          {
            $eq: ['$status', 'ONLINE'],
          },
          1,
          0,
        ],
      },
      numberOffline: {
        $cond: [
          {
            $eq: ['$status', 'OFFLINE'],
          },
          1,
          0,
        ],
      },
    },
  };
  const group = {
    $group: {
      _id: {
        date: '$date',
        device: '$device',
      },
      online: {
        $sum: '$numberOnline',
      },
      offline: {
        $sum: '$numberOffline',
      },
      RAM: {
        $avg: '$RAM',
      },
      CPU: {
        $avg: '$CPU',
      },
    },
  };

  const projectTwo = {
    $project: {
      _id: 0,
      online: 1,
      date: '$_id.date',
      device: '$_id.device',
      offline: 1,
      RAM: 1,
      CPU: 1,
    },
  };

  const sort = {
    $sort: {
      date: 1,
    },
  };

  aggregate = [
    matchOne,
    ...lookup,
    matchTwo,
    projectOne,
    group,
    projectTwo,
    sort,
  ];

  const data = await DailyDeviceHistory.aggregate(aggregate);
  const result = [];
  data.forEach((item) => {
    const indexDevice = result.findIndex(
      (j) => `${j.device._id}` === `${item.device._id}`,
    );
    if (indexDevice > -1) {
      result[indexDevice].data.push(item);
      // result[indexDevice].data.push(omit(item, ['device']));
    } else {
      const object = {
        device: item.device,
        data: [item],
        // data: [omit(item, ['device'])],
      };
      result.push(object);
    }
  });
  return result;
  // if (data.length < 1) {
  //   return [
  //     {
  //       online: 0,
  //       date: today,
  //       RAM: 0,
  //       CPU: 0,
  //     },
  //   ];
  // }
  // return data;
};
