// createEmbed.js

const { EmbedBuilder, Colors } = require('discord.js');

/**
 * 埋め込みメッセージを生成します。
 * @param {object} client - Discord クライアント
 * @param {object} options - 埋め込みオプション
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {Array<{ name: string, value: string, inline?: boolean }>} [options.fields]
 * @param {string} [options.color]
 * @param {{ url: string }} [options.image]
 * @param {{ url: string }} [options.thumbnail]
 * @returns {EmbedBuilder}
 */
function createEmbed(client, {
  title,
  description,
  fields,
  color,
  image,
  thumbnail,
} = {}) {
  const embed = new EmbedBuilder();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  if (Array.isArray(fields) && fields.length > 0) {
    const validFields = fields.filter(
      f => typeof f.name === 'string' && typeof f.value === 'string'
    );
    if (validFields.length > 0) embed.addFields(validFields);
  }

  if (image?.url) embed.setImage(image.url);
  if (thumbnail?.url) embed.setThumbnail(thumbnail.url);

  embed.setColor(color || Colors.Aqua);
  embed.setTimestamp();
  embed.setFooter({
    text: client.user.displayName,
    iconURL: client.user.displayAvatarURL() || undefined,
  });

  return embed;
}

module.exports = { createEmbed };