const VOICE_IDS = {
  hiroyuki: '19d55439-312d-4a1d-a27b-28f0f31bedc5',
  daigo: 'cc48dfd2-2a89-42f8-8d87-e9acdd2cb584',
};

/**
 * Coefont でテキストを WAV に変換してバッファを返す
 * @param {string} text
 * @param {'hiroyuki'|'daigo'} voice
 * @returns {Promise<Buffer>}
 */
async function getWavBuffer(text, voice) {
  const coefontId = VOICE_IDS[voice];
  if (!coefontId) throw new Error(`未対応のvoiceです: ${voice}`);

  const postRes = await fetch(`https://backend.coefont.cloud/coefonts/${coefontId}/try`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant: 'maker-tts-v2', text }),
  });

  const { location: wavUrl } = await postRes.json();
  if (!wavUrl) throw new Error('WAV URLが返ってきませんでした');

  const wavRes = await fetch(wavUrl);
  return Buffer.from(await wavRes.arrayBuffer());
}

module.exports = { getWavBuffer };
