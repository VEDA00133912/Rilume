const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  PermissionFlagsBits,
  ChannelType,
  channelMention,
} = require('discord.js');
const Impersonate = require('../../models/ImpersonateGuild');
const Webhook = require('../../models/webhook');

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('setting-impersonate')
    .setDescription('webhookを使用するimpersonateの設定')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageWebhooks | PermissionFlagsBits.ManageChannels)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addStringOption((opt) =>
      opt
        .setName('on-off')
        .setDescription('設定のオンオフを指定(省略可)')
        .addChoices(
          { name: 'impersonateコマンドON', value: 'true' },
          { name: 'impersonateコマンドOFF', value: 'false' },
        ),
    )
    .addBooleanOption((opt) =>
      opt.setName('create-channel').setDescription('専用チャンネルを新しく作成しますか？(YES=true, NO=false)'),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const onOff = interaction.options.getString('on-off');
    const createChannel = interaction.options.getBoolean('create-channel') ?? false;

    const status = onOff === 'true' ? true : onOff === 'false' ? false : createChannel ? true : null;
    const shouldCreateChannel = status === true && createChannel;

    let settings = await Impersonate.findOne({ guildId: interaction.guild.id });

    if (!settings) {
      settings = await Impersonate.create({
        guildId: interaction.guild.id,
        impersonate: status ?? true,
        channelId: null,
      });
    } else if (settings.impersonate === status && !shouldCreateChannel) {
      return interaction.editReply(`すでにこのサーバーの設定は**${status ? 'ON' : 'OFF'}**になっています`);
    } else if (status !== null) {
      settings.impersonate = status;
      await settings.save();
    }

    let channelMsg = '';

    if (shouldCreateChannel) {
      if (settings.channelId) {
        channelMsg = `\n既存の専用チャンネル ${channelMention(settings.channelId)}`;
      } else {
        try {
          // 既存のWebhookを削除
          const webhooks = await Webhook.find({ guildId: interaction.guild.id });

          await Promise.all(
            webhooks.map(async (wh) => {
              try {
                const channel = await interaction.guild.channels.fetch(wh.channelId).catch(() => null);
                if (channel) {
                  const fetched = await channel.fetchWebhooks().catch(() => null);
                  await fetched?.get(wh.webhookId)?.delete('専用チャンネル作成のため削除');
                }
                await Webhook.deleteOne({ _id: wh._id });
              } catch (err) {
                console.warn(`Webhook削除失敗: ${wh.webhookId}`, err);
              }
            }),
          );

          const channel = await interaction.guild.channels.create({
            name: 'impersonate専用',
            type: ChannelType.GuildText,
            topic: 'impersonate専用チャンネル',
            reason: 'impersonate専用チャンネルの作成',
          });

          settings.channelId = channel.id;
          await settings.save();

          channelMsg = `\n専用チャンネル ${channelMention(channel.id)} を作成しました。\nチャンネル名や権限は自由に変更してもらってかまいません`;
        } catch (err) {
          console.error(err);
          channelMsg = '\n専用チャンネルの作成に失敗しました';
        }
      }
    }

    await interaction.editReply(`impersonateコマンドが**${status ? 'ON' : 'OFF'}**に設定されました${channelMsg}`);
  },
};
