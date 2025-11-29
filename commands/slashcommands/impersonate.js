const {
  SlashCommandBuilder,
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
  channelMention,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const WebhookModel = require('../../models/webhook');
const Impersonate = require('../../models/ImpersonateGuild');
const { checkBotPermissions } = require('../../utils/checkPermissions');
const invalidContentChecks = require('../../utils/invalidContentRegex');

const FORBIDDEN_NAMES = ['clyde', 'automod', 'discord'];

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('impersonate')
    .setDescription('指定したユーザーになりすましてWebhookでメッセージを送信')
    .addStringOption((opt) => opt.setName('content').setDescription('送信するメッセージ').setRequired(true))
    .addUserOption((opt) => opt.setName('target').setDescription('なりすますユーザー').setRequired(true))
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const content = interaction.options.getString('content');
    const target = interaction.options.getUser('target');
    const { guild } = interaction;

    const settings = await Impersonate.findOne({ guildId: guild.id });

    if (settings?.impersonate === false || settings?.impersonate === 'false') {
      return interaction.editReply('このサーバーでは impersonate コマンドは無効になっています');
    }

    if (!(await checkBotPermissions(interaction, [PermissionFlagsBits.ManageWebhooks]))) return;

    let channel = interaction.channel;

    if (settings?.channelId) {
      const allowedChannel = guild.channels.cache.get(settings.channelId);

      if (!allowedChannel) {
        return interaction.editReply('設定されている専用チャンネルが見つかりません。管理者が削除した可能性があります');
      }

      if (channel.id !== settings.channelId) {
        return interaction.editReply(`このサーバーでは専用チャンネルのみで使用できます → ${channelMention(settings.channelId)}`);
      }

      channel = allowedChannel;
    }

    if (channel.type !== ChannelType.GuildText) {
      return interaction.editReply('このコマンドはテキストチャンネルでのみ使用可能です');
    }

    const invalid = invalidContentChecks.find((c) => c.regex.test(content));
    if (invalid) return interaction.editReply(invalid.error);

    const user = await guild.members.fetch(target.id).then((m) => m.user).catch(() => null)
      ?? await interaction.client.users.fetch(target.id).catch(() => null);

    if (!user) return interaction.editReply('指定されたユーザーを取得できませんでした。');

    const displayname = user.displayName || user.username;
    const avatarURL = user.displayAvatarURL({ size: 1024, forceStatic: false });

    if (FORBIDDEN_NAMES.some((n) => displayname.toLowerCase().includes(n))) {
      return interaction.editReply('このユーザー名は使用できません');
    }

    if (!channel.permissionsFor(interaction.client.user)?.has(PermissionFlagsBits.ManageWebhooks)) {
      return interaction.editReply('このチャンネルではWebhookを作成する権限がありません');
    }

    const webhook = await getOrCreateWebhook(interaction.client, guild.id, channel);

    try {
      await webhook.send({ content, username: displayname, avatarURL });
      return interaction.editReply('送信完了!');
    } catch (err) {
      if (err.code === 10015) {
        const newWebhook = await createAndSaveWebhook(channel, guild.id);
        try {
          await newWebhook.send({ content, username: displayname, avatarURL });
          return interaction.editReply('送信完了!');
        } catch {
          return interaction.editReply('Webhookでの送信に失敗しました');
        }
      }
      return interaction.editReply('Webhookでの送信に失敗しました');
    }
  },
};

async function getOrCreateWebhook(client, guildId, channel) {
  const dbWebhook = await WebhookModel.findOne({ guildId, channelId: channel.id });

  if (dbWebhook) {
    try {
      return await client.fetchWebhook(dbWebhook.webhookId, dbWebhook.token);
    } catch {
      await WebhookModel.deleteOne({ guildId, channelId: channel.id });
    }
  }

  return createAndSaveWebhook(channel, guildId);
}

async function createAndSaveWebhook(channel, guildId) {
  const webhook = await channel.createWebhook({ name: 'ImpersonateWebhook' });

  await WebhookModel.findOneAndUpdate(
    { guildId, channelId: channel.id },
    { webhookId: webhook.id, token: webhook.token },
    { upsert: true },
  );

  return webhook;
}
