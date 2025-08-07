const { SlashCommandBuilder } = require('discord.js');
const { generateTotsuzenshi } = require('../../lib/totsuzenshi/totsuzenshi');
const invalidContentChecks = require('../../utils/invalidContentRegex');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('totsuzenshi')
    .setDescription('突然の死ジェネレータ')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('生成したいテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100),
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

    const totsuzenshi = generateTotsuzenshi(text);

    await interaction.editReply({ content: totsuzenshi });
  },
};
