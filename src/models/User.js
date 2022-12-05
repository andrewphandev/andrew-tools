import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { ROLE } from '../constants/enum';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      min: 3,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
      min: 3,
    },
    avatar: {
      type: String,
      required: true,
      default: '',
    },
    title: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ROLE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// eslint-disable-next-line func-names
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  const salt = 10;
  bcrypt.hash(user.password, salt, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// eslint-disable-next-line func-names
userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return cb(err);
    return cb(null, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
