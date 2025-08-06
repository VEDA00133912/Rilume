const axios = require('axios');

const TRANSLATE_API_URL =
  'https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec';
const GENERIC_ERROR_MESSAGE = 'エラーが発生しました';
const REQUEST_ERROR_MESSAGE = '翻訳リクエスト中にエラーが発生しました';
const GOOGLE_SCRIPT_ERROR_SIGNATURE =
  '<link rel="shortcut icon" href="//ssl.gstatic.com/docs/script/images/favicon.ico"><title>Error</title>'; // エラー時に返ってくるHTMLの一部

/**
 * Google Apps Script を利用した翻訳API呼び出し
 * @param {string} text - 翻訳したい元のテキスト
 * @param {string} source - ソース言語（例：'ja'）
 * @param {string} target - ターゲット言語（例：'en'）
 * @returns {Promise<string>} 翻訳されたテキスト、またはエラーメッセージ
 */

async function translator(text, source, target) {
  try {
    const response = await axios.get(TRANSLATE_API_URL, {
      params: { text, source, target },
    });

    const isGoogleScriptError = response.data.includes(
      GOOGLE_SCRIPT_ERROR_SIGNATURE,
    );
    if (isGoogleScriptError) {
      return GENERIC_ERROR_MESSAGE;
    }

    return response.data;
  } catch (error) {
    return REQUEST_ERROR_MESSAGE;
  }
}

module.exports = { translator };
