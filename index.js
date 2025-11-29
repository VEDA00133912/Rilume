require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const getCommandFiles = require('./utils/getCommandFiles');

for (const filePath of getCommandFiles(join(__dirname, 'commands'))) {
  const cmd = require(filePath);
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  else console.log(`[WARNING] ${filePath} is missing "data" or "execute".`);
}

for (const file of readdirSync(join(__dirname, 'events')).filter(f => f.endsWith('.js'))) {
  const event = require(join(__dirname, 'events', file));
  client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
}

client.login(process.env.TOKEN);