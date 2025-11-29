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

const GUILD_ID = '1327953028619304981';
const ANNOUNCE_CHANNEL_ID = '1405744801084735559';
const CHANNEL_NAME = 'りょうんち製作所お知らせ';

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('follow-announce')
    .setDescription('りょうんち製作所からのお知らせチャンネルを作成します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const requiredPerms = [PermissionFlagsBits.ManageWebhooks, PermissionFlagsBits.ManageChannels];
    if (!(await checkBotPermissions(interaction, requiredPerms))) return;

    const existing = interaction.guild.channels.cache.find(
      (c) => c.name === CHANNEL_NAME && c.type === ChannelType.GuildText,
    );

    if (existing) {
      return interaction.editReply(`既に同じ名前のチャンネル ${channelMention(existing.id)} が存在します`);
    }

    const [guild, followChannel] = await Promise.all([
      interaction.client.guilds.fetch(GUILD_ID),
      interaction.guild.channels.create({ name: CHANNEL_NAME, type: ChannelType.GuildText }),
    ]);

    const announceChannel = await guild.channels.fetch(ANNOUNCE_CHANNEL_ID);
    await announceChannel.addFollower(followChannel.id);

    await interaction.editReply(`${channelMention(followChannel.id)} を作成しました`);
  },
};
