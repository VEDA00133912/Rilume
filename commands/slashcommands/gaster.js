const { SlashCommandBuilder } = require('discord.js');
const { specialTranslator } = require('../../lib/translate/specialTranslator');
const invalidContentChecks = require('../../utils/invalidContentRegex');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('gaster')
    .setDescription('ガスター文字に変換します')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('変換したいテキスト(※日本語非対応)')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    ),

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

    const gasterText = await specialTranslator('gaster', text);
    const embed = createEmbed(interaction.client, {
      title: 'ガスター文字への変換が完了しました！',
      fields: [
        { name: '元のテキスト', value: text },
        { name: 'ガスター文字', value: gasterText },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
