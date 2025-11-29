const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答速度を確認します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const start = Date.now();
    await interaction.reply({ content: '🏓 Ping! 計測中...' });

    const botLatency = Date.now() - start;
    const apiLatency = interaction.client.ws.ping;

    await interaction.editReply(`🏓 Pong!\nBot Latency: **${botLatency}ms**\nAPI Latency: **${apiLatency}ms**`);
  },
};
