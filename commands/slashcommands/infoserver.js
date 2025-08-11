const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const getServerInfo = require('../../utils/getServerInfo');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('サーバー情報を表示します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  async execute(interaction) {
    const info = await getServerInfo(interaction.guild);

    const embed = createEmbed(interaction.client, {
      title: info.title,
      fields: info.fields,
      thumbnail: info.thumbnail,
      color: info.color,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
