const JapiInfo = require('./japiInfo');

const USER_TYPES = { system: 'システム', bot: 'BOT', user: 'ユーザー' };

async function getUserInfo(guild, user) {
  const member = await guild.members.fetch(user.id).catch(() => null);

  const avatar =
    member?.displayAvatarURL({ size: 2048, forceStatic: false }) ||
    user.displayAvatarURL({ size: 2048, forceStatic: false });

  const displayName = member?.displayName || user.username;
  const roleColor = member?.roles?.highest?.color || 0xffffff;

  const userType = user.system ? 'system' : user.bot ? 'bot' : 'user';

  const fields = [
    { name: 'ユーザーID', value: user.id },
    { name: 'アカウント作成日', value: user.createdAt?.toLocaleDateString('ja-JP') ?? '不明' },
  ];

  if (member?.joinedAt) {
    fields.push({ name: 'サーバー参加日', value: member.joinedAt.toLocaleDateString('ja-JP') });
  }

  const topRole = member?.roles?.highest;
  if (topRole && topRole.id !== guild.id) {
    fields.push({ name: '最高位ロール', value: topRole.toString() });
  }

  const japiInfo = await JapiInfo(user.id);

  if (japiInfo?.tag) {
    fields.push({ name: 'サーバータグ', value: japiInfo.tag });
  }

  if (japiInfo?.badges?.length) {
    fields.push({ name: 'バッジ', value: japiInfo.badges.join(' ') });
  }

  return {
    title: `${displayName}の${USER_TYPES[userType]}情報`,
    thumbnail: avatar,
    color: `#${roleColor.toString(16).padStart(6, '0')}`,
    fields,
  };
}

module.exports = getUserInfo;
