const {
  SlashCommandBuilder,
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
    .setDescription('このチャンネルの一番最初のメッセージを表示します'),

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
        content:
          '<:error:1302169165905526805> メッセージが見つかりませんでした。',
        ephemeral: true,
      });
    }

    const embed = createEmbed(interaction.client, {
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
