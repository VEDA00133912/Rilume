const { EmbedBuilder, Colors } = require('discord.js');

function createEmbed(
  client,
  { title, description, fields, color, image, thumbnail, author, footer } = {},
) {
  const embed = new EmbedBuilder();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  if (Array.isArray(fields) && fields.length > 0) {
    const validFields = fields.filter(
      (f) =>
        typeof f.name === 'string' &&
        typeof f.value === 'string' &&
        (f.inline === undefined || typeof f.inline === 'boolean'),
    );

    if (validFields.length > 0) embed.addFields(validFields);
  }

  if (image) embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);

  if (author?.name) {
    embed.setAuthor({
      name: author.name,
      iconURL: author.iconURL,
    });
  }

  embed.setFooter({
    text: footer || client.user.displayName,
    iconURL: client.user.displayAvatarURL() || undefined,
  });

  embed.setColor(color || Colors.Aqua);
  embed.setTimestamp();

  return embed;
}

module.exports = { createEmbed };
