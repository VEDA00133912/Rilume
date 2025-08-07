// 元コード↓
// https://github.com/kozaku05/AniCord/blob/main/api-data.js

const axios = require('axios');
const xml2js = require('xml2js');
const ANIME_API_URL = 'https://cal.syoboi.jp/db.php?Command=TitleLookup&TID=';

async function getRandomAnime(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const TID = Math.floor(Math.random() * 7500) + 1;
    const url = `${ANIME_API_URL}${TID}`;

    try {
      const { data } = await axios.get(url);
      const parsed = await xml2js.parseStringPromise(data);
      const item = parsed?.TitleLookupResponse?.TitleItems?.[0]?.TitleItem?.[0];

      if (item) {
        return {
          title: item.Title?.[0],
          id: item.$.id,
        };
      }
    } catch (err) {
      console.warn(`[getAnime] TID ${TID} failed:`, err.message);
    }
  }

  return null;
}

module.exports = getRandomAnime;
