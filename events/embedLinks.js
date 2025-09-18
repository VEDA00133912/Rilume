const { Events, ChannelType } = require('discord.js');
const { createEmbed } = require('../utils/createEmbed');
const invalidContentChecks = require('../utils/invalidContentRegex');
const {
  getMessageTypeDescription,
} = require('../utils/getMessageTypeDescription');
const { checkBlacklist, handleSpamCheck } = require('../utils/blackList');
const Expand = require('../models/expandGuild');
const MAX_LENGTH = 400;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    if (!message.guild) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    const settings = await Expand.findOne({ guildId: message.guild.id });

    if (settings && settings.expand === false) return;

    if (await checkBlacklist(message.author.id)) return;

    const linkRegex =
      /https:\/\/(?:canary\.|ptb\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;

    const match = linkRegex.exec(message.content);

    if (!match) return;

    if (await handleSpamCheck(message.author.id)) return;

    const [fullUrl, , channelId, messageId] = match;

    const client = message.client;

    try {
      const channel = await client.channels.fetch(channelId);

      if (!channel) return;

      const targetMsg = await channel.messages.fetch(messageId);

      for (const check of invalidContentChecks) {
        if (check.regex.test(targetMsg.content)) {
          return;
        }
      }

      const descriptionFromType = getMessageTypeDescription(targetMsg, fullUrl);
      let description = descriptionFromType || targetMsg.content || '';

      let image;
      const attachments = targetMsg.attachments;

      if (attachments.size === 1) {
        const firstAttachment = attachments.first();

        if (firstAttachment?.contentType?.startsWith('image/')) {
          image = firstAttachment.proxyURL;
        } else {
          description += `\n📎 添付ファイル: ${firstAttachment.name || 'ファイル'}`;
        }
      } else if (attachments.size > 1) {
        description += `\n📎 添付ファイルが${attachments.size}件あります`;
      }

      if (description.length > MAX_LENGTH) {
        description = description.slice(0, MAX_LENGTH - 3) + '...';
      }

      const embedOptions = {
        author: {
          name: targetMsg.member?.displayName || targetMsg.author.tag,
          iconURL: targetMsg.author.displayAvatarURL({ size: 64 }),
        },
        footer: `sent by ${targetMsg.author.tag}`,
        description,
        image,
      };

      const embed = createEmbed(client, embedOptions);

      await message.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      if (error.code && [10008, 50001, 50013].includes(error.code)) return;
      console.error('メッセージリンク処理中にエラー:', error.message);
    }
  },
};
