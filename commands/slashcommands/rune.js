const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { specialTranslator } = require('../../lib/translate/specialTranslator');
const invalidContentChecks = require('../../utils/invalidContentRegex');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('rune')
    .setDescription('ルーン文字に変換します')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('変換したいテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    const invalid = invalidContentChecks.find((c) => c.regex.test(text));
    if (invalid) return interaction.editReply(invalid.error);

    const result = await specialTranslator('rune', text);

    await interaction.editReply({
      embeds: [
        createEmbed(interaction, {
          title: 'ルーン文字への変換が完了しました！',
          fields: [
            { name: '元のテキスト', value: text },
            { name: 'ルーン文字', value: result },
          ],
        }),
      ],
    });
  },
};
