const { Events } = require('discord.js');
const ExpandGuild = require('../models/expandGuild');
const ImpersonateGuild = require('../models/ImpersonateGuild');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    try {
      await ExpandGuild.findOneAndUpdate(
        { guildId: guild.id },
        { expand: false },
        { upsert: true, new: true },
      );

      await ImpersonateGuild.findOneAndUpdate(
        { guildId: guild.id },
        { impersonate: false, channelId: null },
        { upsert: true, new: true },
      );

      console.log(
        `Initial registration completed for ${guild.name} (${guild.id})`,
      );
    } catch (error) {
      console.error('初期登録に失敗しました:', error);
    }
  },
};
