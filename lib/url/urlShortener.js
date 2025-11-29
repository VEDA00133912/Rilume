const API_KEY = process.env.XGD_API_KEY;

const services = {
  async xgd(url) {
    if (!API_KEY) throw new Error('x.gdのAPIキーが設定されていません');

    const res = await fetch(`https://xgd.io/V1/shorten?${new URLSearchParams({ url, key: API_KEY })}`);
    const data = await res.json();

    if (data.status !== 200) throw new Error(data.message || 'x.gd短縮エラー');
    return data.shorturl;
  },

  async isgd(url) {
    const res = await fetch(`https://is.gd/create.php?${new URLSearchParams({ format: 'json', url })}`);
    const data = await res.json();

    if (!data.shorturl) throw new Error(data.errormessage || 'is.gd短縮エラー');
    return data.shorturl;
  },

  async cleanuri(url) {
    const res = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url }),
    });
    const data = await res.json();

    if (!data.result_url) throw new Error('CleanURI短縮エラー');
    return data.result_url;
  },
};

/**
 * URLを短縮する
 * @param {string} url
 * @param {'xgd'|'isgd'|'cleanuri'} service
 * @returns {Promise<string>}
 */
async function shortenUrl(url, service = 'xgd') {
  if (!url) throw new Error('URLが指定されていません');

  const handler = services[service];
  if (!handler) throw new Error('無効なサービスが指定されました');

  return handler(url);
}

module.exports = { shortenUrl };
