const { userMention } = require('discord.js');
const { getServerEmoji } = require('../../utils/emoji');

async function getServerInfo(guild) {
  const [allMembers, ownerMember, bans] = await Promise.all([
    guild.members.fetch(),
    guild.fetchOwner(),
    guild.bans.fetch().catch(() => ({ size: 0 })),
  ]);

  const userCount = allMembers.filter((m) => !m.user.bot).size;
  const botCount = allMembers.filter((m) => m.user.bot).size;

  const { premiumTier, premiumSubscriptionCount = 0 } = guild;

  return {
    title: `${guild.name}のサーバー情報`,
    thumbnail: guild.iconURL({ size: 1024, forceStatic: false }) || 'https://cdn.discordapp.com/embed/avatars/1.png',
    fields: [
      { name: `${getServerEmoji('ID')} サーバーID`, value: guild.id },
      { name: `${getServerEmoji('BIRTHDAY')} 作成日`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` },
      { name: `${getServerEmoji('OWNER')} オーナー`, value: `${userMention(guild.ownerId)} (${ownerMember.user.tag})` },
      { name: `${getServerEmoji('USER')} ユーザー`, value: `${userCount}人`, inline: true },
      { name: `${getServerEmoji('BOT')} BOT`, value: `${botCount}人`, inline: true },
      { name: `${getServerEmoji('CHANNEL')} チャンネル`, value: `${guild.channels.cache.size}個` },
      { name: `${getServerEmoji('EMOJI')} 絵文字`, value: `${guild.emojis.cache.size}個`, inline: true },
      { name: `${getServerEmoji('BAN')} BAN`, value: `${bans.size}人`, inline: true },
      { name: `${getServerEmoji('BOOST', premiumSubscriptionCount)} サーバーブースト`, value: `レベル${premiumTier} (${premiumSubscriptionCount}回)` },
    ],
  };
}

module.exports = getServerInfo;
