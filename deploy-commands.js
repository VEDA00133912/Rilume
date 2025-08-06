const { REST, Routes } = require('discord.js');
const path = require('node:path');
require('dotenv').config();
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const getCommandFilesRecursively = require('./utils/getCommandFiles');

module.exports = async function deployCommands(client) {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = getCommandFilesRecursively(commandsPath);

  for (const filePath of commandFiles) {
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  const rest = new REST().setToken(TOKEN);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
};