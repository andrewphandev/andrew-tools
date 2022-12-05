import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
