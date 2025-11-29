const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  guildId: {
    type: String,
    require: false
  },
  channelId: {
    type: String,
    required: true,
    unique: true,
  },
  webhookId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Webhooks', webhookSchema);
