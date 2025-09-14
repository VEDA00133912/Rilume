const mongoose = require('mongoose');

const impersonateGuildsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  impersonate: {
    type: Boolean,
    default: true,
  },
  channelId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('ImpersonateGuilds', impersonateGuildsSchema);
