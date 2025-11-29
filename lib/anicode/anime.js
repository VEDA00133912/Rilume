const { parseStringPromise } = require('xml2js');

const ANIME_API_URL = 'https://cal.syoboi.jp/db.php?Command=TitleLookup&TID=';

async function getRandomAnime(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const tid = Math.floor(Math.random() * 7500) + 1;

    try {
      const res = await fetch(`${ANIME_API_URL}${tid}`);
      const xml = await res.text();
      const parsed = await parseStringPromise(xml);

      const item = parsed?.TitleLookupResponse?.TitleItems?.[0]?.TitleItem?.[0];

      if (item) {
        return { title: item.Title?.[0], id: item.$.id };
      }
    } catch (err) {
      console.warn(`[getAnime] TID ${tid} failed:`, err.message);
    }
  }

  return null;
}

module.exports = getRandomAnime;
