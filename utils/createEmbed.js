const { EmbedBuilder, Colors } = require('discord.js');

/**
 * 埋め込みメッセージを生成します。
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {Array<{ name: string, value: string, inline?: boolean }>} [options.fields]
 * @param {string} [options.color]
 * @returns {EmbedBuilder}
 */

function createEmbed(client, { title, description, fields, color } = {}) {
  const embed = new EmbedBuilder();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  if (Array.isArray(fields) && fields.length > 0) {
    const validFields = fields.filter(
      f => typeof f.name === 'string' && typeof f.value === 'string'
    );

    if (validFields.length > 0) {
      embed.addFields(validFields);
    }
  }

  embed.setColor(color || Colors.Aqua);
  embed.setTimestamp();
  embed.setFooter({
    text: client.user.displayName,
    iconURL: client.user.displayAvatarURL() || undefined,
  });

  return embed;
}

module.exports = { createEmbed };