const { Events } = require('discord.js');
const { resumeTimers } = require('../lib/timer/setTimer');
const deployCommands = require('../deploy-commands');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await deployCommands(client);
    console.log(`Ready! Logged in as ${client.user.tag}`);
    await resumeTimers(client);
  },
};
