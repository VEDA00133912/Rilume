const { getBadgeEmojis } = require('../../utils/emoji');

async function JapiInfo(userId) {
  try {
    const res = await fetch(`https://japi.rest/discord/v1/user/${userId}`);
    const json = await res.json();
    const data = json?.data;

    if (!data) return null;

    return {
      tag: data.clan?.tag ?? data.primary_guild?.tag ?? null,
      badges: getBadgeEmojis(data.public_flags_array || []),
    };
  } catch (err) {
    console.error(`tagの取得に失敗: ${err.message}`);
    return null;
  }
}

module.exports = JapiInfo;
