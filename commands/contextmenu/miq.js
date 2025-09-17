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
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const targetMessage = interaction.targetMessage;

    if (!targetMessage.content || targetMessage.content.trim().length === 0) {
      return interaction.editReply({
        content: 'このメッセージにはテキストがありません',
      });
    }

    for (const check of invalidContentChecks) {
      if (check.regex.test(targetMessage.content)) {
        return interaction.editReply({ content: check.error });
      }
    }

    const miq = new MiQ()
      .setFromMessage(targetMessage)
      .setColor(true)
      .setWatermark(interaction.client.user.tag);

    const response = await miq.generateBeta();
    const fileName = `miq-${targetMessage.id}.png`;
    const attachment = new AttachmentBuilder(response, { name: fileName });

    const embed = createEmbed(interaction, {
      description: `**[元メッセージへ飛ぶ🕊️](${targetMessage.url})**`,
      image: `attachment://${fileName}`,
    });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  },
};
