const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { shortenUrl } = require('../../lib/url/urlShortener');

const isValidUrl = (str) => URL.canParse?.(str) ?? (() => { try { new URL(str); return true; } catch { return false; } })();

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('short')
    .setDescription('URLを短縮します')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('短縮したいURLを入力してください').setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('service')
        .setDescription('使用する短縮サービスを選択')
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
    const service = interaction.options.getString('service') ?? 'xgd';

    if (!isValidUrl(url)) {
      return interaction.editReply('有効なURLを入力してください');
    }

    try {
      const shortUrl = await shortenUrl(url, service);

      await interaction.editReply({
        embeds: [
          createEmbed(interaction, {
            description: shortUrl,
            fields: [{ name: '元のURL', value: url }],
          }),
        ],
      });
    } catch (err) {
      console.error(err.message);
      await interaction.editReply(err.message);
    }
  },
};
