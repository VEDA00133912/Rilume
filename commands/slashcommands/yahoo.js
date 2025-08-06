const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { fetchYahooNews } = require('../../lib/scrape/fetchYahooNews');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('yahoo')
    .setDescription('Yahooニュースの最新記事を取得します'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const link = await fetchYahooNews();
    await interaction.editReply({ content: `${link}` });
  },
};
