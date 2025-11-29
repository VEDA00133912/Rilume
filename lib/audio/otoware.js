const decode = (...args) => import('audio-decode').then((m) => m.default(...args));
const wavEncoder = require('wav-encoder');

/**
 * 音声データを読み込んで音割れさせて、WAVバッファを返す
 * @param {Buffer} buffer - 音声ファイルのバッファ
 * @param {number} gain - 音割れの強さ
 * @returns {Promise<Buffer>} - WAV形式のバッファ
 */
async function otoware(buffer, gain = 50) {
  const audioBuffer = await decode(buffer);
  const { numberOfChannels, sampleRate } = audioBuffer;

  const channelData = Array.from({ length: numberOfChannels }, (_, ch) => {
    const data = audioBuffer.getChannelData(ch);

    for (let i = 0, len = data.length; i < len; i++) {
      data[i] = Math.tanh(data[i] * gain);
    }

    return data;
  });

  return wavEncoder.encode({ sampleRate, channelData });
}

module.exports = otoware;
