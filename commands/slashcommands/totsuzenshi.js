const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { generateTotsuzenshi } = require('../../lib/totsuzenshi/totsuzenshi');
const invalidContentChecks = require('../../utils/invalidContentRegex');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('totsuzenshi')
    .setDescription('突然の死ジェネレータ')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('生成したいテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    if (!text) {
      return interaction.editReply({ content: 'テキストが指定されていません' });
    }

    const invalid = invalidContentChecks.find((c) => c.regex.test(text));
    if (invalid) return interaction.editReply(invalid.error);
    
    const totsuzenshi = generateTotsuzenshi(text);

    await interaction.editReply({ content: totsuzenshi });
  },
};
