const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const getUserInfo = require('../../lib/info/getUserInfo');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('ユーザー情報を表示します')
    .addUserOption((opt) => opt.setName('target').setDescription('情報を取得するユーザー'))
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall),

  async execute(interaction) {
    const user = interaction.options.getUser('target') ?? interaction.user;
    const info = await getUserInfo(interaction.guild, user);

    await interaction.reply({ embeds: [createEmbed(interaction, info)] });
  },
};
