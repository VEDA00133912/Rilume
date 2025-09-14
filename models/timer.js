const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  timeLeft: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
});

const Timer = mongoose.model('Timers', timerSchema);

module.exports = {
  Timer,
};
