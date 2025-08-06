const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const gosenChoyen_API_URL = 'https://gsapi.cbrx.io/image';

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('5000choyen')
    .setDescription('5000兆円欲しい!!画像を生成します')
    .addStringOption((option) =>
      option
        .setName('top')
        .setDescription('上部に表示するテキスト')
        .setRequired(true)
        .setMaxLength(30),
    )
    .addStringOption((option) =>
      option
        .setName('bottom')
        .setDescription('下部に表示するテキスト')
        .setRequired(true)
        .setMaxLength(30),
    ),

  async execute(interaction) {
    const topText = interaction.options.getString('top');
    const bottomText = interaction.options.getString('bottom');

    const response = `${gosenChoyen_API_URL}?top=${encodeURIComponent(topText)}&bottom=${encodeURIComponent(bottomText)}&type=png`;
    const embed = createEmbed(interaction.client, {
      image: { url: response },
    });

    await interaction.reply({ embeds: [embed] });
  },
};
