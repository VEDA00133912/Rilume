const { userMention } = require('discord.js');
const { getServerEmoji } = require('../../utils/emoji');

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

  const boostLevel = guild.premiumTier;
  const boostCount = guild.premiumSubscriptionCount ?? 0;

  return {
    title: `${guild.name}のサーバー情報`,
    thumbnail: iconURL,
    fields: [
      { name: `${getServerEmoji('ID')} サーバーID`, value: guild.id },
      { name: `${getServerEmoji('BIRTHDAY')} 作成日`, value: createdTimestamp },
      { name: `${getServerEmoji('OWNER')} オーナー`, value: owner },
      {
        name: `${getServerEmoji('USER')} ユーザー`,
        value: `${userCount}人`,
        inline: true,
      },
      {
        name: `${getServerEmoji('BOT')} BOT`,
        value: `${botCount}人`,
        inline: true,
      },
      {
        name: `${getServerEmoji('CHANNEL')} チャンネル`,
        value: `${channelCount}個`,
      },
      {
        name: `${getServerEmoji('EMOJI')} 絵文字`,
        value: `${emojiCount}個`,
        inline: true,
      },
      {
        name: `${getServerEmoji('BAN')} BAN`,
        value: `${banCount}人`,
        inline: true,
      },
      {
        name: `${getServerEmoji('BOOST', boostCount)} サーバーブースト`,
        value: `レベル${boostLevel} (${boostCount}回)`,
      },
    ],
  };
}

module.exports = getServerInfo;
