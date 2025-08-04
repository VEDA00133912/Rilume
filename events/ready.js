// ready.js
// 起動処理

const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    require('../deploy-commands')(client);
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};