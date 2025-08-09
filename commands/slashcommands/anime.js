const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const getRandomAnime = require('../../lib/anicode/anime');
const { createEmbed } = require('../../utils/createEmbed');
const SYOBOI_URL = 'https://cal.syoboi.jp/tid/';

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('ランダムに1つアニメを取得します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const result = await getRandomAnime();

    if (result) {
      const link = `${SYOBOI_URL}${result.id}`;
      const embed = createEmbed(interaction.client, {
        title: 'アニメを取得しました！',
        description: `タイトル: **${result.title}**\n🔗 [リンク](${link})`,
        footer: 'Powered by しょぼいカレンダー',
      });

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply('見つかりませんでした');
    }
  },
};
