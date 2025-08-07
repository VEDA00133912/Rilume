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
      (f) => typeof f.name === 'string' && typeof f.value === 'string',
    );

    if (validFields.length > 0) embed.addFields(validFields);
  }

  if (image?.url) embed.setImage(image.url);
  if (thumbnail?.url) embed.setThumbnail(thumbnail.url);

  if (author?.name) {
    embed.setAuthor({
      name: author.name,
      iconURL: author.iconURL,
    });
  }

  embed.setFooter({
    text: (footer && footer.name) || client.user.displayName,
    iconURL: client.user.displayAvatarURL() || undefined,
  });

  embed.setColor(color || Colors.Aqua);
  embed.setTimestamp();

  return embed;
}

module.exports = { createEmbed };
