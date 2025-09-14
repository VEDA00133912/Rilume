const mongoose = require('mongoose');

const expandSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  expand: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Expands', expandSchema);
