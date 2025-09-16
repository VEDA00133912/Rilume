const { ActivityType, PresenceUpdateStatus } = require('discord.js');

const statuses = ['{ Rilime } /help', 'Server: {server} / Member: {member}'];

let index = 0;

/**
 * ステータスを30秒ごとに切り替える
 * @param {import('discord.js').Client} client
 */
function startStatusRotation(client) {
  setInterval(() => {
    try {
      let template = statuses[index];

      if (template.includes('{server}')) {
        const serverCount = client.guilds.cache.size;
        const memberCount = client.guilds.cache.reduce(
          (total, g) => total + (g.memberCount ?? 0),
          0,
        );

        template = template
          .replace('{server}', serverCount)
          .replace('{member}', memberCount);
      }

      client.user.setPresence({
        activities: [{ name: template, type: ActivityType.Custom }],
        status: PresenceUpdateStatus.Online,
      });
    } catch (err) {
      console.error('Error setting presence:', err);
    }

    index = (index + 1) % statuses.length;
  }, 30000);
}

module.exports = { startStatusRotation };
