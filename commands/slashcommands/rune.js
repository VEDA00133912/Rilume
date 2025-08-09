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
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('変換したいテキスト(※漢字非対応)')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    if (!text) {
      return interaction.editReply({ content: 'テキストが指定されていません' });
    }

    for (const check of invalidContentChecks) {
      if (check.regex.test(text)) {
        return interaction.editReply({ content: check.error });
      }
    }

    const runeText = await specialTranslator('rune', text);
    const embed = createEmbed(interaction.client, {
      title: 'ルーン文字への変換が完了しました！',
      fields: [
        { name: '元のテキスト', value: text },
        { name: 'ルーン文字', value: runeText },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
