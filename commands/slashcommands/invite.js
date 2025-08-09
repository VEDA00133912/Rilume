const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Botの招待リンクを表示します')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = createEmbed(interaction.client, {
      description: '以下のリンクからBotを導入できます',
      fields: [
        {
          name: 'リンク',
          value: `**[ここをクリックして導入](https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id})**`,
        },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
