import mongoose from 'mongoose';
import { DEVICE_KEY_TYPE, DEVICE_STATUS, DEVICE_TYPE } from '../constants/enum';
import Crypto from '../services/Crypto';

const deviceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: DEVICE_TYPE,
    },
    keyType: {
      type: String,
      enum: DEVICE_KEY_TYPE,
    },
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: String,
      required: true,
    },
    building: {
      type: String,
      required: true,
    },
    lab: {
      type: String,
      required: true,
    },
    rack: {
      type: String,
      required: true,
    },
    assle: {
      type: String,
      required: true,
    },
    isDMZ: {
      type: Boolean,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      match:
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    },
    username: {
      type: String,
      required: true,
      min: 3,
    },
    password: {
      type: String,
      required: true,
    },
    currentStatus: {
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
    timestamps: true,
    versionKey: false,
  },
);

// eslint-disable-next-line func-names
deviceSchema.pre('save', function (next) {
  const device = this;
  if (device.isModified('password')) {
    device.password = Crypto.encrypt(device.password);
  }

  if (device.isModified('type')) {
    device.keyType = DEVICE_KEY_TYPE.find((i) => device.type.includes(i));
  }
  next();
});

// eslint-disable-next-line func-names
deviceSchema.methods.originalPassword = function () {
  return Crypto.decrypt(this.password);
};

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
