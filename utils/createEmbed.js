const { EmbedBuilder, Colors } = require('discord.js');

function createEmbed(interactionOrClient, options = {}) {
  const { title, url, description, fields, color, image, thumbnail, author, footer, timestamp } = options;

  const client = interactionOrClient?.client ?? interactionOrClient;
  const isInteraction = !!interactionOrClient?.commandName;

  const embed = new EmbedBuilder()
    .setColor(color || Colors.Aqua)
    .setTimestamp(timestamp);

  if (title) embed.setTitle(title);
  if (url) embed.setURL(url);
  if (description) embed.setDescription(description);
  if (image) embed.setImage(image);
  if (thumbnail) embed.setThumbnail(thumbnail);

  if (author?.name) {
    embed.setAuthor({ name: author.name, iconURL: author.iconURL });
  }

  if (fields?.length) {
    const valid = fields.filter(
      (f) => typeof f.name === 'string' && typeof f.value === 'string',
    );
    if (valid.length) embed.addFields(valid);
  }

  const commandName = isInteraction
    ? `/${interactionOrClient.commandName}${interactionOrClient.options.getSubcommand(false) ? ` ${interactionOrClient.options.getSubcommand(false)}` : ''}`
    : '';

  embed.setFooter({
    text: `${client.user.displayName}${commandName ? `  ${commandName}` : ''}`,
    iconURL: footer?.iconURL || client.user.displayAvatarURL(),
  });

  return embed;
}

module.exports = { createEmbed };
