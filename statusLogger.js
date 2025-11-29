const { scheduleJob, RecurrenceRule } = require('node-schedule');
const Status = require('./models/statusLogger');

const logStatus = (client) => Status.create({
  online: true,
  guildCount: client.guilds.cache.size,
  guildMember: client.guilds.cache.reduce((a, g) => a + (g.memberCount ?? 0), 0),
});

function scheduleLogging(client) {
  const rule = new RecurrenceRule();
  rule.minute = [0, 30];
  rule.tz = 'Asia/Tokyo';
  scheduleJob(rule, () => logStatus(client));
}

module.exports = { logStatus, scheduleLogging };
