const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ApplicationIntegrationType,
  AttachmentBuilder,
  MessageFlags,
} = require('discord.js');
const { MiQ } = require('makeitaquote');
const invalidContentChecks = require('../../utils/invalidContentRegex');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new ContextMenuCommandBuilder()
    .setName('Make it a Quote')
    .setType(ApplicationCommandType.Message)
    .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const { targetMessage } = interaction;

    if (!targetMessage.content?.trim()) {
      return interaction.editReply({ content: 'このメッセージにはテキストがありません' });
    }

    const invalid = invalidContentChecks.find(c => c.regex.test(targetMessage.content));
    if (invalid) return interaction.editReply({ content: invalid.error });

    const response = await new MiQ()
      .setFromMessage(targetMessage)
      .setColor(true)
      .setWatermark(interaction.client.user.tag)
      .generateBeta();

    const fileName = `miq-${targetMessage.id}.png`;

    await interaction.editReply({
      embeds: [createEmbed(interaction, {
        description: `**[元メッセージへ飛ぶ🕊️](${targetMessage.url})**`,
        image: `attachment://${fileName}`,
      })],
      files: [new AttachmentBuilder(response, { name: fileName })],
    });
  },
};
