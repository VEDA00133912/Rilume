const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const TLANSLATE_API_URL = 'https://oji.itstom.dev/api/translate';
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('ojisan')
    .setDescription('おじさん構文に変換します')
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('変換したいテキストを入力')
        .setRequired(true),
    ),

  async execute(interaction) {
    const inputText = interaction.options.getString('text');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const response = await axios.post(
      TLANSLATE_API_URL,
      { text: inputText },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const translated = response.data?.translation ?? '翻訳結果が見つかりません';

    const embed = createEmbed(interaction.client, {
      fields: [
        { name: '入力テキスト', value: inputText },
        { name: 'おじさん構文', value: translated },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
