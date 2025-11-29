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

  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, user, guild, channel } = interaction;

    if (customId === 'create') {
      const existing = guild.channels.cache.find(
        (c) => c.type === ChannelType.GuildText && c.name === `チケット-${user.id}`,
      );

      if (existing) {
        return interaction.reply({
          content: `既に作成済です\nhttps://discord.com/channels/${guild.id}/${existing.id}`,
          flags: MessageFlags.Ephemeral,
        });
      }

      const ticketChannel = await guild.channels.create({
        name: `チケット-${user.id}`,
        type: ChannelType.GuildText,
        reason: `Created by: ${user.tag}`,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: user.id,
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

      await interaction.reply({
        content: `作成しました\nhttps://discord.com/channels/${guild.id}/${ticketChannel.id}`,
        flags: MessageFlags.Ephemeral,
      });

      await ticketChannel.send({
        embeds: [
          createEmbed(interaction, {
            description: 'チケットチャンネルを作成しました。\n削除するときは下のボタンを押してください',
            color: Colors.Red,
          }),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket-delete').setStyle(ButtonStyle.Danger).setLabel('削除'),
          ),
        ],
      });
    }

    if (customId === 'ticket-delete') {
      const creatorId = channel.name.split('-')[1];
      const canDelete = user.id === creatorId || interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);

      if (!canDelete) {
        return interaction.reply({
          content: 'あなたには削除権限がありません',
          flags: MessageFlags.Ephemeral,
        });
      }

      await channel.delete();
    }
  },
};
