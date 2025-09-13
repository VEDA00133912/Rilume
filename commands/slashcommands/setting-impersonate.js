const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  PermissionFlagsBits,
} = require('discord.js');
const Impersonate = require('../../models/ImpersonateGuild');

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('setting-impersonate')
    .setDescription('webhookを使用するimpersonateコマンドの設定')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addStringOption((option) =>
      option
        .setName('on-off')
        .setDescription('設定のオンオフを指定(デフォルトON)')
        .setRequired(true)
        .addChoices(
          { name: 'impersonateコマンドON', value: 'true' },
          { name: 'impersonateコマンドOFF', value: 'false' },
        ),
    ),

  async execute(interaction) {
    const status = interaction.options.getString('on-off') === 'true';

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    let settings = await Impersonate.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      settings = new Impersonate({
        guildId: interaction.guild.id,
        impersonate: status,
      });
      await settings.save();
    } else if (settings.impersonate === status) {
      return interaction.editReply(
        `すでにこのサーバーの設定は**${status ? 'ON' : 'OFF'}**になっています`,
      );
    } else {
      settings.impersonate = status;
      await settings.save();
    }

    await interaction.editReply(
      `impersonateコマンドが**${status ? 'ON' : 'OFF'}**に設定されました`,
    );
  },
};
