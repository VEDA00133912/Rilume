const TRANSLATE_API_URL =
  'https://script.google.com/macros/s/AKfycbyZzeACcCpM2PNgoYN1jg64CTzZcXCx-xYHp9WC6yNQYdrCmyYcER-_vR8A-D2Epvok_w/exec';

const GOOGLE_SCRIPT_ERROR_SIGNATURE = '<link rel="shortcut icon" href="//ssl.gstatic.com/docs/script/images/favicon.ico">';

/**
 * Google Apps Script を利用した翻訳API呼び出し
 * @param {string} text
 * @param {string} source
 * @param {string} target
 * @returns {Promise<string>}
 */
async function translator(text, source, target) {
  try {
    const url = `${TRANSLATE_API_URL}?${new URLSearchParams({ text, source, target })}`;
    const res = await fetch(url);
    const data = await res.text();

    return data.includes(GOOGLE_SCRIPT_ERROR_SIGNATURE) ? 'エラーが発生しました' : data;
  } catch (err) {
    console.error('Translation API error:', err);
    return '翻訳リクエスト中にエラーが発生しました';
  }
}

module.exports = { translator };
