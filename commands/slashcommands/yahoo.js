const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { scrapeYahooNews } = require('../../lib/scrape/scrapeYahooNews');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('yahoo')
    .setDescription('Yahooニュースの最新記事を取得します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const link = await scrapeYahooNews();

    await interaction.editReply({ content: `${link}` });
  },
};
