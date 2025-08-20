const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { getWavBuffer } = require('../../lib/audio/coefont');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('daigo')
    .setDescription('テキストをメンタリストDaiGoのボイスに変換します')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('音声にするテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    ),
  async execute(interaction) {
    const text = interaction.options.getString('text');

    await interaction.deferReply();

    const wavBuffer = await getWavBuffer(text, 'daigo');
    const attachment = new AttachmentBuilder(wavBuffer, {
      name: `daigo_${text}.wav`,
    });

    await interaction.editReply({
      content: '変換が完了しました',
      files: [attachment],
    });
  },
};
