const AdmZip = require('adm-zip');

/**
 * サーバーの絵文字をZIPにまとめる
 * @param {Guild} guild
 * @returns {Promise<Buffer|string|null>}
 */
async function createEmoZip(guild) {
  const emojis = await guild.emojis.fetch().catch(() => null);

  if (!emojis) return null;
  if (emojis.size === 0) return 'このサーバーには絵文字がありません';

  const zip = new AdmZip();

  const results = await Promise.allSettled(
    emojis.map(async (emoji) => {
      const ext = emoji.animated ? 'gif' : 'webp';
      const url = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=2048&animated=true`;

      const res = await fetch(url);
      if (!res.ok) return;

      zip.addFile(`${emoji.name}.${ext}`, Buffer.from(await res.arrayBuffer()));
    }),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  if (succeeded === 0) return null;

  return zip.toBuffer();
}

module.exports = { createEmoZip };
