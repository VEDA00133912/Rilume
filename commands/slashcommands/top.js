const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { checkBotPermissions } = require('../../utils/checkPermissions');
const invalidContentChecks = require('../../utils/invalidContentRegex');
const { getMessageTypeDescription } = require('../../utils/getMessageTypeDescription');

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.ReadMessageHistory,
];

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('このチャンネルの一番最初のメッセージを表示します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const { channel } = interaction;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: 'このコマンドはテキストチャンネルでのみ使用できます',
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    const messages = await channel.messages.fetch({ after: '0', limit: 1 });
    const msg = messages.first();

    if (!msg) {
      return interaction.reply({
        content: 'メッセージが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });
    }

    const invalid = invalidContentChecks.find((c) => c.regex.test(msg.content));
    if (invalid) {
      return interaction.reply({ content: invalid.error, flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({
      embeds: [
        createEmbed(interaction, {
          author: { name: msg.author.username, iconURL: msg.author.displayAvatarURL() },
          description: getMessageTypeDescription(msg) || msg.content || '不明なメッセージ',
          timestamp: msg.createdAt,
        }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel('元のメッセージへ').setStyle(ButtonStyle.Link).setURL(msg.url),
        ),
      ],
    });
  },
};
