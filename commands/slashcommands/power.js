const {
  SlashCommandBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { power } = require('../../lib/calc/power');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('power')
    .setDescription('累乗計算を行います')
    .addNumberOption((option) =>
      option
        .setName('base')
        .setDescription('底')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(9000000000000000),
    )
    .addNumberOption((option) =>
      option
        .setName('exponent')
        .setDescription('指数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(9000000000000000),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),
  async execute(interaction) {
    await interaction.deferReply();

    const base = interaction.options.getNumber('base');
    const exponent = interaction.options.getNumber('exponent');

    const result = power(base, exponent);
    const resultStr = result.toString();

    if (resultStr.length > 100) {
      const buffer = Buffer.from(resultStr, 'utf-8');
      const file = new AttachmentBuilder(buffer, {
        name: `${base}^${exponent}.txt`,
      });

      await interaction.editReply({
        content: `計算が完了しました`,
        files: [file],
      });
    } else {
      await interaction.editReply(
        `計算が完了しました\n${base}^${exponent} = ${resultStr}`,
      );
    }
  },
};
