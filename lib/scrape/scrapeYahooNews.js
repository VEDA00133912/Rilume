const axios = require('axios');
const cheerio = require('cheerio');
const YAHOO_URL = 'https://www.yahoo.co.jp/';

async function scrapeYahooNews() {
  try {
    const response = await axios.get(YAHOO_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);

    const newsLinks = $('a[href*="news.yahoo.co.jp/pickup"]')
      .map((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();

        return { href, title };
      })
      .get();

    if (newsLinks.length === 0) return null;

    const selected = newsLinks[Math.floor(Math.random() * newsLinks.length)];

    return `[${selected.title}](${selected.href})`;
  } catch (error) {
    console.error('Yahooニュース取得エラー:', error);

    return null;
  }
}

module.exports = {
  scrapeYahooNews,
};
