// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const TOKEN = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.cooldowns = new Collection();

// コマンドのロード
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => {
  const fullPath = path.join(commandsPath, file);
  return fs.statSync(fullPath).isFile() && file.endsWith('.js');
});

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// イベントのロード
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(TOKEN);

// Expressサーバーの設定
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});