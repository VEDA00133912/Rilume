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
const {
  getMessageTypeDescription,
} = require('../../utils/getMessageTypeDescription');

module.exports = {
  cooldown: 15,
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

    for (const check of invalidContentChecks) {
      if (check.regex.test(msg.content)) {
        return interaction.reply({
          content: check.error,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    const descriptionFromType = getMessageTypeDescription(msg);
    let embedContent = descriptionFromType || msg.content || '';

    const messageLinkButton = new ButtonBuilder()
      .setLabel('元のメッセージへ')
      .setStyle(ButtonStyle.Link)
      .setURL(msg.url);

    const actionRow = new ActionRowBuilder().addComponents(messageLinkButton);

    const embed = createEmbed(interaction, {
      author: {
        name: msg.author.username,
        iconURL: msg.author.displayAvatarURL(),
      },
      description: embedContent || '不明なメッセージ',
      timestamp: msg.createdAt,
    });

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  },
};
