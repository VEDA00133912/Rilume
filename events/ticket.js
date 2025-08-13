const {
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  Colors,
  ChannelType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../utils/createEmbed');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {import('discord.js').Interaction} interaction - Discordのインタラクション
   */
  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'create') {
      const userId = interaction.user.id;
      const guild = interaction.guild;

      // 既存チャンネルチェック（テキストチャンネル限定）
      const existingChannel = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildText &&
          channel.name === `チケット-${userId}`,
      );

      if (existingChannel) {
        return interaction.reply({
          content: `既に作成済です\nhttps://discord.com/channels/${guild.id}/${existingChannel.id}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const ticketChannel = await guild.channels.create({
        name: `チケット-${userId}`,
        type: ChannelType.GuildText,
        reason: `Created by: ${interaction.user.tag}`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: userId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
            ],
          },
        ],
      });

      // 常に reply
      await interaction.reply({
        content: `作成しました\nhttps://discord.com/channels/${guild.id}/${ticketChannel.id}`,
        flags: MessageFlags.Ephemeral,
      });

      const del = new ButtonBuilder()
        .setCustomId('ticket-delete')
        .setStyle(ButtonStyle.Danger)
        .setLabel('削除');

      const embed = createEmbed(interaction, {
        description:
          'チケットチャンネルを作成しました。\n削除するときは下のボタンを押してください',
        color: Colors.Red,
      });

      const button = new ActionRowBuilder().addComponents(del);

      await ticketChannel.send({
        embeds: [embed],
        components: [button],
      });
    }

    if (interaction.customId === 'ticket-delete') {
      await this.deleteTicket(interaction);
    }
  },

  /**
   * チケット削除処理
   * @param {import('discord.js').ButtonInteraction} interaction - ボタンからのインタラクション
   */
  async deleteTicket(interaction) {
    const userId = interaction.user.id;
    const member = interaction.member;
    const channel = interaction.channel;
    const channelCreatorId = channel.name.split('-')[1];

    // 作成者か、またはManageChannels権限があれば削除許可
    const isCreator = userId === channelCreatorId;
    const canManage = member.permissions.has(
      PermissionFlagsBits.ManageChannels,
    );

    if (!isCreator && !canManage) {
      return interaction.reply({
        content: 'あなたには削除権限がありません',
        flags: MessageFlags.Ephemeral,
      });
    }

    await channel.delete();
  },
};
