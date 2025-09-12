const { Events } = require('discord.js');
const mongoose = require('mongoose');
const { resumeTimers } = require('../lib/timer/setTimer');
const deployCommands = require('../deploy-commands');
const { scheduleLogging, logStatus } = require('../statusLogger');
const MONGODB_URI = process.env.MONGODB_URI;

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await deployCommands(client);
    console.log(`Ready! Logged in as ${client.user.tag}`);

    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDBに接続されました');

      require('../lib/omikuji/resetOmikuji');
      await resumeTimers(client);

      await logStatus(client);
      scheduleLogging(client);
    } catch (error) {
      console.error('❌ MongoDB接続エラー:', error.message);
    }
  },
};
