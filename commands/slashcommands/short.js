const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { shortenUrl } = require('../../lib/url/urlShortener');

function isValidUrl(string) {
  try {
    new URL(string);

    return true;
  } catch {
    return false;
  }
}

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('short')
    .setDescription('URLを短縮します')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('短縮したいURLを入力してください')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('service')
        .setDescription('使用する短縮サービスを選択')
        .setRequired(false)
        .addChoices(
          { name: 'x.gd', value: 'xgd' },
          { name: 'is.gd', value: 'isgd' },
          { name: 'CleanURI', value: 'cleanuri' },
        ),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const url = interaction.options.getString('url');
    const service = interaction.options.getString('service') || 'xgd';

    if (!isValidUrl(url))
      return interaction.editReply('有効なURLを入力してください');

    try {
      const shortUrl = await shortenUrl(url, service);
      const embed = createEmbed(interaction, {
        description: shortUrl,
        fields: [{ name: '元のURL', value: url }],
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err.message);
      await interaction.editReply(err.message);
    }
  },
};
