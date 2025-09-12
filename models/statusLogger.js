const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  online: Boolean,
  guildCount: Number,
  guildMember: Number,
});

module.exports = mongoose.model('Status', statusSchema);
