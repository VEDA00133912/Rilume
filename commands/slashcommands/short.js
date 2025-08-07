const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const { createEmbed } = require('../../utils/createEmbed');
const API_KEY = process.env.XGD_API_KEY;
const XGD_API_URL = 'https://xgd.io/V1/shorten';

// URLの検証関数
function isValidUrl(string) {
  try {
    new URL(string);

    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('short')
    .setDescription('URLを短縮します(x.gd使用)')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('短縮したいURLを入力してください')
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const originalUrl = interaction.options.getString('url');

    if (!API_KEY) {
      return await interaction.editReply(
        'x.gdのAPIキーが設定されていません。管理者(ryo_001339)へ連絡してください',
      );
    }

    if (!isValidUrl(originalUrl)) {
      return await interaction.editReply('有効なURLを入力してください。');
    }

    const response = await axios.get(XGD_API_URL, {
      params: {
        url: originalUrl,
        key: API_KEY,
      },
    });

    const data = response.data;

    if (data.status !== 200) {
      return await interaction.editReply(
        `URL短縮に失敗しました: ${data.message || '不明なエラー'}`,
      );
    }

    const shortUrl = data.shorturl;

    const embed = createEmbed(interaction.client, {
      title: 'URL短縮結果',
      description: shortUrl,
      fields: [{ name: '元のURL', value: originalUrl }],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
