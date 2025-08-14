const decode = (...args) => import('audio-decode').then(m => m.default(...args));
const wavEncoder = require('wav-encoder');

/**
 * 音声データを読み込んで音割れさせて、WAVバッファを返す
 * @param {Buffer} buffer - 音声ファイルのバッファ
 * @param {number} gain - 音割れの強さ
 * @returns {Promise<Buffer>} - WAV形式のバッファ
 */
async function otoware(buffer, gain = 50) {
  const audioBuffer = await decode(buffer);

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      let x = data[i] * gain;
      data[i] = Math.tanh(x);
    }
  }

  const wavData = {
    sampleRate: audioBuffer.sampleRate,
    channelData: Array.from({ length: audioBuffer.numberOfChannels }, (_, i) =>
      audioBuffer.getChannelData(i)
    )
  };

  return wavEncoder.encode(wavData);
}

module.exports = otoware;
