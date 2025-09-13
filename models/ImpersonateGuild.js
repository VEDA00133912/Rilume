const mongoose = require('mongoose');

const impersonateSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  impersonate: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('ImpersonateGuild', impersonateSchema);
