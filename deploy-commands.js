require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { join } = require('node:path');
const getCommandFiles = require('./utils/getCommandFiles');

module.exports = async function deployCommands(client) {
  const commands = [];

  for (const filePath of getCommandFiles(join(__dirname, 'commands'))) {
    const cmd = require(filePath);
    if (cmd.data && cmd.execute) {
      client.commands.set(cmd.data.name, cmd);
      commands.push(cmd.data.toJSON());
    } else {
      console.log(`[WARNING] ${filePath} is missing "data" or "execute".`);
    }
  }

  const rest = new REST().setToken(process.env.TOKEN);

  try {
    console.log(`Refreshing ${commands.length} commands...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log(`Reloaded ${commands.length} commands.`);
  } catch (e) {
    console.error(e.message);
  }
};
