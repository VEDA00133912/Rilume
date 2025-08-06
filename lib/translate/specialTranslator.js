const axios = require('axios');

const TRANSLATE_API_URL = 'https://api-ryo001339.onrender.com';
const ERROR_MESSAGE = '翻訳中にエラーが発生しました';

/**
 * 指定されたタイプでテキストを変換します。
 * @param {string} type - 変換の種類 ('rune' または 'gaster')
 * @param {string} text - 変換するテキスト
 * @returns {Promise<string>} 変換結果またはエラーメッセージ
 */

async function specialTranslator(type, text) {
  switch (type) {
    case 'rune':
    case 'gaster':
      return await translateWithAPI(type, text);
    default:
      return ERROR_MESSAGE;
  }
}

/**
 * 外部APIを使ってテキストを変換します。
 * @param {string} type - 'rune' か 'gaster'
 * @param {string} text - 変換するテキスト
 * @returns {Promise<string>} APIからの変換テキストまたはエラーメッセージ
 */

async function translateWithAPI(type, text) {
  try {
    const { data } = await axios.get(
      `${TRANSLATE_API_URL}/${type}/${encodeURIComponent(text)}`,
    );
    return data.status === 200 ? data.transformatedText : ERROR_MESSAGE;
  } catch (error) {
    return ERROR_MESSAGE;
  }
}

module.exports = { specialTranslator };
