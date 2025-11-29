const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const getRandomAnime = require('../../lib/anicode/anime');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('anime')
    .setDescription('ランダムに1つアニメを取得します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await getRandomAnime();

    if (!result) {
      return interaction.editReply('見つかりませんでした');
    }

    await interaction.editReply({
      embeds: [
        createEmbed(interaction, {
          title: 'アニメを取得しました！',
          description: `タイトル: **${result.title}**\n🔗 [リンク](https://cal.syoboi.jp/tid/${result.id})`,
          footer: 'Powered by しょぼいカレンダー',
        }),
      ],
    });
  },
};
