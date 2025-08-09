const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { generateTotsuzenshi } = require('../../lib/totsuzenshi/totsuzenshi');
const invalidContentChecks = require('../../utils/invalidContentRegex');

module.exports = {
  cooldown: 5,
  data: new ContextMenuCommandBuilder()
    .setName('突然の死ジェネレータ')
    .setType(ApplicationCommandType.Message)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const text = interaction.targetMessage.content;

    for (const check of invalidContentChecks) {
      if (check.regex.test(text)) {
        return interaction.editReply({ content: check.error });
      }
    }

    if (text.length < 1 || text.length > 100) {
      return interaction.editReply({
        content: 'テキストの長さは1文字以上、100文字以下にしてください',
      });
    }

    const totsuzenshi = generateTotsuzenshi(text);

    await interaction.editReply({ content: totsuzenshi });
  },
};
