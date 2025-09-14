const { EmbedBuilder, Colors } = require('discord.js');

function createEmbed(
  interactionOrClient,
  {
    title,
    url,
    description,
    fields,
    color,
    image,
    thumbnail,
    author,
    footer,
  } = {},
) {
  const embed = new EmbedBuilder();
  const client = interactionOrClient?.client ?? interactionOrClient;
  const isInteraction = !!interactionOrClient?.commandName;

  let commandName = '';

  if (isInteraction) {
    const sub = interactionOrClient.options.getSubcommand(false);

    commandName = `/${interactionOrClient.commandName}${sub ? ` ${sub}` : ''}`;
  }

  if (title) embed.setTitle(title);
  if (url) embed.setURL(url);
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
    text: `${client.user.displayName}${isInteraction ? `  ${commandName}` : ''}`,
    iconURL: footer?.iconURL || client.user.displayAvatarURL() || undefined,
  });

  embed.setColor(color || Colors.Aqua);
  embed.setTimestamp();

  return embed;
}

module.exports = { createEmbed };
