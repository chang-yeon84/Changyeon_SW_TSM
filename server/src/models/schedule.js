const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    departureLocation: {
      type: String,
      trim: true,
    },
    destinationLocation: {
      type: String,
      trim: true,
    },
    transportType: {
      type: String,
      enum: ['walk', 'car', 'bus', 'subway', 'bicycle', 'other'],
    },
    journeyTime: {
      type: String,
    },
    weather: {
      type: String,
    },
    memo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

scheduleSchema.index({ userId: 1, date: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
