const axios = require('axios');
const { getBadgeEmojis } = require('../../utils/emoji');

async function JapiInfo(userId) {
  try {
    const res = await axios.get(`https://japi.rest/discord/v1/user/${userId}`);
    const data = res.data?.data;

    if (!data) return null;

    const clan = data.clan || data.primary_guild || null;
    const badges = getBadgeEmojis(data.public_flags_array || []);

    return {
      tag: clan?.tag || null,
      badges,
    };
  } catch (err) {
    console.error(`tagの取得に失敗: ${err.message}`);

    return null;
  }
}

module.exports = JapiInfo;
