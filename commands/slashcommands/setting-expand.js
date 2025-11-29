const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  PermissionFlagsBits,
} = require('discord.js');
const Expand = require('../../models/expandGuild');

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('setting-expand')
    .setDescription('メッセージリンク自動展開の設定')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addStringOption((opt) =>
      opt
        .setName('on-off')
        .setDescription('設定のオンオフを指定(デフォルトON)')
        .setRequired(true)
        .addChoices(
          { name: '自動展開ON', value: 'true' },
          { name: '自動展開OFF', value: 'false' },
        ),
    ),

  async execute(interaction) {
    const status = interaction.options.getString('on-off') === 'true';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let settings = await Expand.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      settings = new Expand({
        guildId: interaction.guild.id,
        expand: status,
      });
    } else if (settings.expand === status) {
      return interaction.editReply(
        `すでにこのサーバーの設定は**${status ? 'ON' : 'OFF'}**になっています`,
      );
    }

    settings.expand = status;
    await settings.save();

    await interaction.editReply(
      `メッセージリンクの展開機能が**${status ? 'ON' : 'OFF'}**に設定されました`,
    );
  },
};
