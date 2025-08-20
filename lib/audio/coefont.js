const axios = require('axios');

const VOICE_IDS = {
  hiroyuki: '19d55439-312d-4a1d-a27b-28f0f31bedc5',
  daigo: 'cc48dfd2-2a89-42f8-8d87-e9acdd2cb584',
};

/**
 * Coefont でテキストを WAV に変換してバッファを返す
 * @param {string} text
 * @param {'hiroyuki'|'daigo'} voice - キャラクター名
 * @returns {Promise<Buffer>}
 */
async function getWavBuffer(text, voice) {
  const coefontId = VOICE_IDS[voice];

  if (!coefontId) throw new Error(`未対応のvoiceです: ${voice}`);

  const apiUrl = `https://backend.coefont.cloud/coefonts/${coefontId}/try`;

  const postRes = await axios.post(apiUrl, { variant: 'maker-tts', text });
  const wavUrl = postRes.data.location;

  if (!wavUrl) throw new Error('WAV URLが返ってきませんでした');

  const wavRes = await axios.get(wavUrl, { responseType: 'arraybuffer' });

  return Buffer.from(wavRes.data);
}

module.exports = { getWavBuffer };
