const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { checkBotPermissions } = require('../../utils/checkPermissions');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('このチャンネルの一番最初のメッセージを表示します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const channel = interaction.channel;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: 'このコマンドはテキストチャンネルでのみ使用できます',
        flags: MessageFlags.Ephemeral,
      });
    }

    const requiredPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    const msg = await channel.messages
      .fetch({ after: '0', limit: 1 })
      .then((messages) => messages.first());

    if (!msg) {
      return interaction.reply({
        content: 'メッセージが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = createEmbed(interaction, {
      author: {
        name: `${msg.author.displayName || msg.author.username} (${msg.author.username})`,
        iconURL: msg.author.displayAvatarURL(),
      },
      description: msg.content || '不明なメッセージ',
      timestamp: msg.createdAt,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
