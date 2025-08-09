const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionFlagsBits,
  channelMention,
  MessageFlags,
} = require('discord.js');
const { recreateChannel } = require('../../lib/recreate/channel');
const { checkBotPermissions } = require('../../utils/checkPermissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recreate')
    .setDescription('指定したチャンネルを作り直します')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('作り直すチャンネル')
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel');

    const requiredPermissions = [PermissionFlagsBits.ManageChannels];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    await interaction.reply({
      content: `チャンネル ${channelMention(targetChannel.id)} の再作成を開始します…`,
      flags: MessageFlags.Ephemeral,
    });

    await recreateChannel(targetChannel, interaction.user);
  },
};
