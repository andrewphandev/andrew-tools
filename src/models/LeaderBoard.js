import mongoose from 'mongoose';

const leaderBoardSchema = new mongoose.Schema(
  {
    nickName: {
      type: String,
      required: true,
    },
    encryptedUid: {
      type: String,
      required: true,
      unique: true,
      min: 3,
    },
    otherPositionRetList: [
      {
        symbol: String,
        entryPrice: Number,
        markPrice: Number,
        pnl: Number,
        roe: Number,
        updateTime: [Number],
        amount: Number,
        updateTimeStamp: Number,
        yellow: Boolean,
        tradeBefore: Boolean,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const LeaderBoard = mongoose.model('LeaderBoard', leaderBoardSchema);

module.exports = LeaderBoard;
