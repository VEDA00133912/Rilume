const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('node:fs');
const path = require('node:path');

const createEmoZip = async (guild) => {
  let emojis;
  try {
    emojis = await guild.emojis.fetch();
  } catch {
    return null;
  }

  if (emojis.size === 0) {
    // 絵文字0件のときはメッセージを返す
    return 'このサーバーには絵文字がありません';
  }

  const zip = new AdmZip();
  const emojiPromises = [];

  emojis.forEach((emoji) => {
    const isAnimated = emoji.animated;
    const emojiURL = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=2048&animated=true`;
    const extension = isAnimated ? 'gif' : 'webp';
    const fileName = `${emoji.name}.${extension}`;

    emojiPromises.push(
      axios
        .get(emojiURL, { responseType: 'arraybuffer' })
        .then((response) => {
          zip.addFile(fileName, Buffer.from(response.data));
        })
        .catch(() => {})
    );
  });

  try {
    await Promise.all(emojiPromises);

    const zipBuffer = zip.toBuffer();
    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const safeGuildName = guild.name.replace(/[\\/:*?"<>|]/g, '_');
    const zipFileName = `${safeGuildName}-Emoji.zip`;
    const zipFilePath = path.join(tempDir, zipFileName);

    fs.writeFileSync(zipFilePath, zipBuffer);

    setTimeout(() => fs.unlink(zipFilePath, () => {}), 5000);

    return zipFilePath;
  } catch {
    return null;
  }
};

module.exports = { createEmoZip };