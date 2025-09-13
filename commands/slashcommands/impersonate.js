const {
  SlashCommandBuilder,
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const WebhookModel = require('../../models/webhook');
const Impersonate = require('../../models/ImpersonateGuild');
const { checkBotPermissions } = require('../../utils/checkPermissions');
const invalidContentChecks = require('../../utils/invalidContentRegex');

const forbiddenNames = ['clyde', 'automod', 'discord'];

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('impersonate')
    .setDescription('指定したユーザーになりすましてWebhookでメッセージを送信')
    .addStringOption((option) =>
      option
        .setName('content')
        .setDescription('送信するメッセージ')
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('なりすますユーザー')
        .setRequired(true),
    ),

  async execute(interaction) {
    const content = interaction.options.getString('content');
    const target = interaction.options.getUser('target');
    const channel = interaction.channel;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const settings = await Impersonate.findOne({
      guildId: interaction.guild.id,
    });
    const isDisabled =
      settings &&
      (settings.impersonate === false || settings.impersonate === 'false');

    if (isDisabled) {
      return interaction.editReply(
        'このサーバーでは impersonate コマンドは無効になっています',
      );
    }

    const requiredPermissions = [PermissionFlagsBits.ManageWebhooks];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    if (channel.type !== ChannelType.GuildText) {
      return interaction.editReply(
        'このコマンドはテキストチャンネルでのみ使用可能です',
      );
    }

    for (const check of invalidContentChecks) {
      if (check.regex.test(content)) {
        return interaction.editReply({ content: check.error });
      }
    }

    let user;

    try {
      user = await interaction.guild.members
        .fetch(target.id)
        .then((m) => m.user);
    } catch {
      user = await interaction.client.users.fetch(target.id);
    }

    const displayname = user.displayName;
    const avatarURL = user.displayAvatarURL({ size: 1024, forceStatic: false });

    if (
      forbiddenNames.some((name) => displayname.toLowerCase().includes(name))
    ) {
      return interaction.editReply('このユーザー名は使用できません');
    }

    const permissions = channel.permissionsFor(interaction.client.user);

    if (!permissions || !permissions.has(PermissionFlagsBits.ManageWebhooks)) {
      return interaction.editReply(
        'このチャンネルではWebhookを作成する権限がありません',
      );
    }

    let dbWebhook = await WebhookModel.findOne({ channelId: channel.id });
    let webhook;

    if (dbWebhook) {
      try {
        webhook = await interaction.client.fetchWebhook(
          dbWebhook.webhookId,
          dbWebhook.token,
        );
      } catch {
        await WebhookModel.deleteOne({ channelId: channel.id });
        dbWebhook = null;
      }
    }

    if (!dbWebhook) {
      webhook = await channel.createWebhook({ name: 'ImpersonateWebhook' });
      await WebhookModel.create({
        channelId: channel.id,
        webhookId: webhook.id,
        token: webhook.token,
      });
    }

    try {
      await webhook.send({ content, displayname, avatarURL });
    } catch (error) {
      if (error.code === 10015) {
        await WebhookModel.deleteOne({ channelId: channel.id });

        webhook = await channel.createWebhook({ name: 'ImpersonateWebhook' });
        await WebhookModel.create({
          channelId: channel.id,
          webhookId: webhook.id,
          token: webhook.token,
        });

        await webhook.send({ content, displayname, avatarURL });
      } else {
        return interaction.editReply('Webhookでの送信に失敗しました');
      }
    }

    await interaction.editReply('送信完了');
  },
};
