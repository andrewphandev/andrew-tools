import mongoose from 'mongoose';
import { DEVICE_STATUS } from '../constants/enum';

const dailyDeviceHistory = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    device: {
      type: mongoose.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    status: {
      type: String,
      enum: DEVICE_STATUS,
      default: DEVICE_STATUS[0],
      required: true,
    },
    RAM: {
      type: Number,
      default: 0,
    },
    CPU: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const DailyDeviceHistory = mongoose.model(
  'DailyDeviceHistory',
  dailyDeviceHistory,
);

module.exports = DailyDeviceHistory;
