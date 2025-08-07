const axios = require('axios');
const REDIRECT_API_URL = 'https://ntool.online/api/';

/**
 * 指定されたURLのリダイレクト経路を追跡します
 * @param {string} url - チェック対象のURL
 * @returns {Promise<Array<{ url: string }> | { error: string }>}
 */

async function trackRedirects(url) {
  try {
    const response = await axios.get(
      `${REDIRECT_API_URL}redirectChecker?url=${encodeURIComponent(url)}`,
    );

    if (!response.data.length) {
      return {
        error: '取得に失敗しました。サイトに到達できていない可能性があります',
      };
    }

    return response.data.map((item) => ({ url: item.url }));
  } catch (error) {
    console.error(error);

    return { error: 'API呼び出し中にエラーが発生しました' };
  }
}

module.exports = { trackRedirects };
