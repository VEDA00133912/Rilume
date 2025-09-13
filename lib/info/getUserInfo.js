const JapiInfo = require('./japiInfo');

async function getUserInfo(guild, user) {
  const member = await guild.members.fetch(user.id).catch(() => null);

  const avatar =
    member?.displayAvatarURL({ size: 2048, forceStatic: false }) ||
    user.displayAvatarURL({ size: 2048, forceStatic: false });

  const createdTimestamp = user.createdAt
    ? user.createdAt.toLocaleDateString('ja-JP')
    : '不明';

  const joinedTimestamp = member?.joinedAt
    ? member.joinedAt.toLocaleDateString('ja-JP')
    : null;

  const displayName = member?.displayName || user.username;
  const nameColor = `#${(member?.roles?.highest?.color || 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;

  let userType = 'user';

  if (user.system) userType = 'system';
  else if (user.bot) userType = 'bot';

  const title =
    userType === 'bot'
      ? `${displayName}のBOT情報`
      : userType === 'system'
        ? `${displayName}のシステム情報`
        : `${displayName}のユーザー情報`;

  const fields = [
    { name: 'ユーザーID', value: user.id },
    { name: 'アカウント作成日', value: createdTimestamp },
  ];

  if (joinedTimestamp) {
    fields.push({ name: 'サーバー参加日', value: joinedTimestamp });
  }

  if (member) {
    const topRole = member.roles.highest;

    if (topRole && topRole.id !== guild.id) {
      fields.push({ name: '最高位ロール', value: topRole.toString() });
    }
  }

  const japiInfo = await JapiInfo(user.id);

  if (japiInfo) {
    if (japiInfo.tag) {
      fields.push({ name: 'サーバータグ', value: japiInfo.tag });
    }
  }

  if (japiInfo?.badges?.length) {
    fields.push({
      name: 'バッジ',
      value: japiInfo.badges.join(' '),
    });
  }

  return {
    title,
    thumbnail: avatar,
    color: nameColor,
    fields,
  };
}

module.exports = getUserInfo;
