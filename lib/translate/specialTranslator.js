// 一部変換間違いはあるにしても一応漢字、ひらがな、カタカナに対応させました
const kuromoji = require('kuromoji');
const wanakana = require('wanakana');
const path = require('node:path');
const axios = require('axios');

const TRANSLATE_API_URL = 'https://api-ryo001339.onrender.com';
const ERROR_MESSAGE = '翻訳中にエラーが発生しました';

/**
 * 日本語を含むかどうかを判定する
 * @param {string} text - 判定するテキスト
 * @returns {boolean} 日本語（ひらがな・カタカナ・漢字）を含む場合はtrue
 */
function containsJapanese(text) {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

/**
 * 日本語テキストをローマ字に変換する
 * @param {string} text - 変換対象の日本語テキスト
 * @returns {Promise<string>} 変換後のローマ字テキスト
 */
function japaneseToRomaji(text) {
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({
        dicPath: path.resolve(__dirname, '../../node_modules/kuromoji/dict'),
      })
      .build((err, tokenizer) => {
        if (err) return reject(err);

        const tokens = tokenizer.tokenize(text);

        const kana = tokens
          .map((token) =>
            token.reading
              ? wanakana.toHiragana(token.reading)
              : token.surface_form,
          )
          .join('');

        const romaji = wanakana.toRomaji(kana);

        resolve(romaji);
      });
  });
}

/**
 * 外部APIにテキスト変換を依頼する
 * @param {'rune'|'gaster'} type - 変換タイプ
 * @param {string} text - 変換対象のテキスト
 * @returns {Promise<string>} 変換後のテキスト、失敗時はエラーメッセージ
 */
async function translateWithAPI(type, text) {
  try {
    const response = await axios.get(
      `${TRANSLATE_API_URL}/${type}/${encodeURIComponent(text)}`,
    );

    const data = response.data;

    return data?.transformatedText || ERROR_MESSAGE;
  } catch (error) {
    console.error('Special Translation API error:', error);

    return ERROR_MESSAGE;
  }
}

/**
 * 指定タイプの変換を行う。入力に日本語を含む場合はローマ字変換してからAPIに渡す
 * @param {'rune'|'gaster'} type - 変換タイプ
 * @param {string} text - 変換対象テキスト（日本語含む可）
 * @returns {Promise<string>} 変換結果テキスト、失敗時はエラーメッセージ
 */
async function specialTranslator(type, text) {
  if (type !== 'rune' && type !== 'gaster') {
    return ERROR_MESSAGE;
  }

  let inputText = text;

  if (containsJapanese(text)) {
    try {
      inputText = await japaneseToRomaji(text);
    } catch (e) {
      console.error('Japanese to Romaji conversion error:', e);

      return ERROR_MESSAGE;
    }
  }

  return await translateWithAPI(type, inputText);
}

module.exports = { specialTranslator };
