const { Events } = require('discord.js');
const ExpandGuild = require('../models/expandGuild');
const ImpersonateGuild = require('../models/ImpersonateGuild');

module.exports = {
  name: Events.GuildDelete,
  async execute(guild) {
    try {
      await ExpandGuild.deleteOne({ guildId: guild.id });
      await ImpersonateGuild.deleteOne({ guildId: guild.id });

      console.log(`Deleted ${guild.name} (${guild.id})`);
    } catch (error) {
      console.error('データ削除に失敗しました:', error);
    }
  },
};
