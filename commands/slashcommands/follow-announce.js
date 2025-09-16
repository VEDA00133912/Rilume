const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  channelMention,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { checkBotPermissions } = require('../../utils/checkPermissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('follow-announce')
    .setDescription('りょうんち製作所からのお知らせチャンネルを作成します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guildId = '1327953028619304981';
    const announcementChannelId = '1405744801084735559';
    const newChannelName = 'りょうんち製作所お知らせ';

    const guild = await interaction.client.guilds.fetch(guildId);
    const announceChannel = await guild.channels.fetch(announcementChannelId);

    const requiredPermissions = [
      PermissionFlagsBits.ManageWebhooks,
      PermissionFlagsBits.ManageChannels,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    const existingChannel = interaction.guild.channels.cache.find(
      (c) => c.name === newChannelName && c.type === ChannelType.GuildText,
    );

    if (existingChannel) {
      return interaction.editReply(
        `既に同じ名前のチャンネル ${channelMention(existingChannel.id)} が存在します`,
      );
    }

    const followChannel = await interaction.guild.channels.create({
      name: newChannelName,
      type: ChannelType.GuildText,
    });

    await announceChannel.addFollower(followChannel.id);

    await interaction.editReply(
      `${channelMention(followChannel.id)} を作成しました`,
    );
  },
};
