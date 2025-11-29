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
    .addStringOption((opt) => opt.setName('url').setDescription('追跡したいURLを入力').setRequired(true))
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const url = interaction.options.getString('url');
    const result = await trackRedirects(url);

    if (result.error) {
      return interaction.editReply({
        embeds: [
          createEmbed(interaction, {
            title: 'リダイレクト追跡失敗',
            description: `❌ ${result.error}`,
            color: Colors.Red,
          }),
        ],
      });
    }

    await interaction.editReply({
      embeds: [
        createEmbed(interaction, {
          fields: result.map((item, i) => ({
            name: `リダイレクト先 ${i + 1}`,
            value: item.url || '不明なURL',
          })),
          color: Colors.Green,
        }),
      ],
    });
  },
};
