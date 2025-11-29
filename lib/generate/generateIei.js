const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { join } = require('path');

const ICON_SIZE = 500;
const FRAME_PATH = join(__dirname, '../../assets/generator/iei.png');

/**
 * アバター画像から遺影画像を生成
 * @param {Buffer} avatarBuffer
 * @returns {Promise<Buffer>}
 */
async function generateIeiImage(avatarBuffer) {
  const [frameImage, avatarImage] = await Promise.all([
    loadImage(FRAME_PATH),
    loadImage(avatarBuffer),
  ]);

  const canvas = createCanvas(frameImage.width, frameImage.height);
  const ctx = canvas.getContext('2d');

  // アバターをモノクロ化
  const avatarCanvas = createCanvas(avatarImage.width, avatarImage.height);
  const avatarCtx = avatarCanvas.getContext('2d');
  avatarCtx.drawImage(avatarImage, 0, 0);

  const imageData = avatarCtx.getImageData(0, 0, avatarImage.width, avatarImage.height);
  const { data } = imageData;

  for (let i = 0, len = data.length; i < len; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  avatarCtx.putImageData(imageData, 0, 0);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const x = (canvas.width - ICON_SIZE) / 2;
  const y = (canvas.height - ICON_SIZE) / 2;

  ctx.drawImage(avatarCanvas, x, y, ICON_SIZE, ICON_SIZE);
  ctx.drawImage(frameImage, 0, 0);

  return canvas.encode('png');
}

module.exports = { generateIeiImage };
