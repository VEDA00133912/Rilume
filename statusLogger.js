const schedule = require('node-schedule');
const Status = require('./models/statusLogger');

async function logStatus(client) {
  await Status.create({
    online: true,
    guildCount: client.guilds.cache.size,
    guildMember: client.guilds.cache.reduce(
      (a, g) => a + (g.memberCount ?? 0),
      0,
    ),
  });
  console.log('✏️ Status logged:', new Date().toLocaleString('ja-JP'));
}

function scheduleLogging(client) {
  const rule = new schedule.RecurrenceRule();
  rule.minute = [0, 30];
  rule.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule, () => logStatus(client));
}

module.exports = { logStatus, scheduleLogging };
