const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  Colors,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { trackRedirects } = require('../../lib/redirect/redirectTracker');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('redirect')
    .setDescription('URLのリダイレクト調査します')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('追跡したいURLを入力')
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const url = interaction.options.getString('url');
    const redirectResult = await trackRedirects(url);

    if (redirectResult.error) {
      const errorEmbed = createEmbed(interaction.client, {
        title: 'リダイレクト追跡失敗',
        description: `❌ ${redirectResult.error}`,
        color: Colors.Red,
      });

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    const embed = createEmbed(interaction.client, {
      fields: redirectResult.map((item, index) => ({
        name: `リダイレクト先 ${index + 1}`,
        value: item.url || '不明なURL',
      })),
      color: Colors.Green,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
