import mongoose from 'mongoose';
import { ALERT_TYPE } from '../constants/enum';

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ALERT_TYPE,
    },
    device: {
      type: mongoose.Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    key: {
      type: String,
      required: true,
      enum: ['RAM', 'CPU', 'STATUS'],
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
