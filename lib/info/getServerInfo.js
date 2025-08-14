const { userMention } = require('discord.js');

async function getServerInfo(guild) {
  const iconURL =
    guild.iconURL({ size: 1024, forceStatic: false }) ||
    'https://cdn.discordapp.com/embed/avatars/1.png';

  const createdTimestamp = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

  const channelCount = guild.channels.cache.size;

  const allMembers = await guild.members.fetch();

  const userCount = allMembers.filter((member) => !member.user.bot).size;

  const botCount = allMembers.filter((member) => member.user.bot).size;

  const ownerMember = await guild.fetchOwner();
  const owner = `${userMention(guild.ownerId)} (${ownerMember.user.tag})`;

  const emojiCount = guild.emojis.cache.size;

  let banCount = 0;

  try {
    const bans = await guild.bans.fetch();

    banCount = bans.size;
  } catch (error) {
    banCount = 0;
    console.log(error.message);
  }

  return {
    title: `${guild.name}のサーバー情報`,
    thumbnail: iconURL,
    fields: [
      { name: 'サーバーID', value: guild.id },
      { name: '作成日', value: createdTimestamp },
      { name: 'チャンネル', value: `${channelCount}個` },
      { name: 'ユーザー', value: `${userCount}人`, inline: true },
      { name: 'BOT', value: `${botCount}人`, inline: true },
      { name: 'オーナー', value: owner, inline: false },
      { name: '絵文字', value: `${emojiCount}個`, inline: true },
      { name: 'BAN', value: `${banCount}人`, inline: true },
    ],
  };
}

module.exports = getServerInfo;
