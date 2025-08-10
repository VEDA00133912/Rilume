const mongoose = require('mongoose');

const blacklistUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('BlacklistUser', blacklistUserSchema);
