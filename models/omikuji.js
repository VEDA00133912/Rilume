const mongoose = require('mongoose');

const omikujiSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Omikuji', omikujiSchema);