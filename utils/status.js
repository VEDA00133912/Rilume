const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const STATUSES = [
  '{ Rilime } /help',
  'Server: {server} / Member: {member}',
];

let index = 0;

/**
 * ステータスを30秒ごとに切り替える
 * @param {import('discord.js').Client} client
 */
function startStatusRotation(client) {
  setInterval(() => {
    try {
      let text = STATUSES[index];

      if (text.includes('{server}')) {
        const guilds = client.guilds.cache;
        text = text
          .replace('{server}', guilds.size)
          .replace('{member}', guilds.reduce((sum, g) => sum + (g.memberCount ?? 0), 0));
      }

      client.user.setPresence({
        activities: [{ name: text, type: ActivityType.Custom }],
        status: PresenceUpdateStatus.Online,
      });
    } catch (err) {
      console.error('Error setting presence:', err);
    }

    index = (index + 1) % STATUSES.length;
  }, 30_000);
}

module.exports = { startStatusRotation };
