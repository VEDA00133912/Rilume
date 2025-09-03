const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const createEmoZip = async (guild) => {
  let emojis;

  try {
    emojis = await guild.emojis.fetch();
  } catch {
    return null;
  }

  if (emojis.size === 0) {
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
    const tmpDir = os.tmpdir();

    const safeGuildName = guild.name.replace(/[\\/:*?"<>|]/g, '_');
    const uniqueId = crypto.randomUUID();
    const zipFileName = `${safeGuildName}-Emoji-${uniqueId}.zip`;
    const zipFilePath = path.join(tmpDir, zipFileName);

    fs.writeFileSync(zipFilePath, zipBuffer);

    setTimeout(() => {
      try {
        if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
      } catch (err) {
        console.error('Temp file deletion failed:', err.message);
      }
    }, 5000);

    return zipFilePath;
  } catch {
    return null;
  }
};

module.exports = { createEmoZip };
