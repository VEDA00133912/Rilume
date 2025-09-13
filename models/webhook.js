const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Webhook', webhookSchema);
