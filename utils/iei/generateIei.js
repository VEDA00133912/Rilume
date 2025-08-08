const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

/**
 *
 * @param {Buffer} avatarBuffer
 * @returns {Promise<Buffer>}
 */
async function generateIeiImage(avatarBuffer) {
  const frameImage = await loadImage(
    path.join(__dirname, '../../assets/generator/iei.png'),
  );
  const canvas = createCanvas(frameImage.width, frameImage.height);
  const ctx = canvas.getContext('2d');

  const avatarImage = await loadImage(avatarBuffer);

  // モノクロ化
  const tempCanvas = createCanvas(avatarImage.width, avatarImage.height);
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.drawImage(avatarImage, 0, 0);
  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height,
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

    data[i] = data[i + 1] = data[i + 2] = avg;
  }

  tempCtx.putImageData(imageData, 0, 0);

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const iconWidth = 500;
  const iconHeight = 500;
  const iconX = (canvas.width - iconWidth) / 2;
  const iconY = (canvas.height - iconHeight) / 2;

  ctx.drawImage(tempCanvas, iconX, iconY, iconWidth, iconHeight);
  ctx.drawImage(frameImage, 0, 0);

  return canvas.encode('png');
}

module.exports = { generateIeiImage };
