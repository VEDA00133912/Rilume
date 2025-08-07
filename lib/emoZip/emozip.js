const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('node:fs');
const path = require('node:path');

const createEmoZip = async (guild) => {
  const emojis = guild.emojis.cache;

  if (emojis.size === 0) return null;

  const zip = new AdmZip();
  const emojiPromises = [];

  emojis.forEach((emoji) => {
    const isAnimated = emoji.animated;
    const emojiURL = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=2048&animated=true`;

    // 保存時の拡張子だけ変える
    const extension = isAnimated ? 'gif' : 'webp';
    const fileName = `${emoji.name}.${extension}`;

    emojiPromises.push(
      axios
        .get(emojiURL, { responseType: 'arraybuffer' })
        .then((response) => {
          zip.addFile(fileName, Buffer.from(response.data));
        })
        .catch((error) => {
          console.error(
            `絵文字 ${emoji.name} のダウンロードに失敗しました。`,
            error,
          );
        }),
    );
  });

  try {
    await Promise.all(emojiPromises);

    const zipBuffer = zip.toBuffer();

    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const safeGuildName = guild.name.replace(/[\\/:*?"<>|]/g, '_');
    const zipFileName = `${safeGuildName}-Emoji.zip`;
    const zipFilePath = path.join(tempDir, zipFileName);

    fs.writeFileSync(zipFilePath, zipBuffer);

    // 5秒後に削除
    setTimeout(() => {
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error(`一時ファイル削除失敗: ${zipFilePath}`, err);
      });
    }, 5000);

    return zipFilePath;
  } catch (error) {
    console.error('ZIPファイルの生成に失敗しました。', error);

    return null;
  }
};

module.exports = { createEmoZip };
