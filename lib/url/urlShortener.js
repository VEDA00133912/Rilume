const axios = require('axios');
const API_KEY = process.env.XGD_API_KEY;
const XGD_API_URL = 'https://xgd.io/V1/shorten';

/**
 * URLを短縮する関数
 * @param {string} url - 短縮したいURL
 * @param {string} service - 使用するサービス（xgd / isgd / cleanuri）
 * @returns {Promise<string>} 短縮URL
 */
async function shortenUrl(url, service = 'xgd') {
  if (!url) throw new Error('URLが指定されていません');

  if (service === 'xgd') {
    if (!API_KEY) throw new Error('x.gdのAPIキーが設定されていません');
    const response = await axios.get(XGD_API_URL, {
      params: { url, key: API_KEY },
    });
    const data = response.data;

    if (data.status !== 200) throw new Error(data.message || 'x.gd短縮エラー');

    return data.shorturl;
  } else if (service === 'isgd') {
    const response = await axios.get('https://is.gd/create.php', {
      params: { format: 'json', url },
    });
    const data = response.data;

    if (!data.shorturl) throw new Error(data.errormessage || 'is.gd短縮エラー');

    return data.shorturl;
  } else if (service === 'cleanuri') {
    const params = new URLSearchParams();

    params.append('url', url);
    const response = await axios.post(
      'https://cleanuri.com/api/v1/shorten',
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );
    const data = response.data;

    if (!data.result_url) throw new Error('CleanURI短縮エラー');

    return data.result_url;
  } else {
    throw new Error('無効なサービスが指定されました');
  }
}

module.exports = { shortenUrl };
