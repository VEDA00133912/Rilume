const kuromoji = require('kuromoji');
const wanakana = require('wanakana');
const { resolve } = require('node:path');

const TRANSLATE_API_URL = 'https://api-ryo001339.onrender.com';
const ERROR_MESSAGE = '翻訳中にエラーが発生しました';
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

// トークナイザーをキャッシュ
let tokenizerPromise = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: resolve(__dirname, '../../node_modules/kuromoji/dict') })
        .build((err, tokenizer) => (err ? reject(err) : resolve(tokenizer)));
    });
  }
  return tokenizerPromise;
}

/**
 * 日本語テキストをローマ字に変換
 */
async function japaneseToRomaji(text) {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);

  const kana = tokens
    .map((t) => (t.reading ? wanakana.toHiragana(t.reading) : t.surface_form))
    .join('');

  return wanakana.toRomaji(kana);
}

/**
 * 指定タイプの変換を行う
 * @param {'rune'|'gaster'} type
 * @param {string} text
 */
async function specialTranslator(type, text) {
  if (type !== 'rune' && type !== 'gaster') return ERROR_MESSAGE;

  try {
    const input = JAPANESE_REGEX.test(text) ? await japaneseToRomaji(text) : text;

    const res = await fetch(`${TRANSLATE_API_URL}/${type}/${encodeURIComponent(input)}`);
    const data = await res.json();

    return data?.transformatedText || ERROR_MESSAGE;
  } catch (err) {
    console.error('Special Translation error:', err);
    return ERROR_MESSAGE;
  }
}

module.exports = { specialTranslator };
