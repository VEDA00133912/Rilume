const { Events } = require('discord.js');
const { createEmbed } = require('../utils/createEmbed');
const {
  getMessageTypeDescription,
} = require('../utils/getMessageTypeDescription');
const MAX_LENGTH = 500;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const linkRegex =
      /https:\/\/(?:canary\.|ptb\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/g;
    const match = linkRegex.exec(message.content);

    if (!match) return;

    const [fullUrl, , channelId, messageId] = match;
    const client = message.client;

    try {
      const channel = await client.channels.fetch(channelId);

      if (!channel) return;

      const targetMsg = await channel.messages.fetch(messageId);
      const inviteOrImgurRegex =
        /(https?:\/\/(?:www\.)?(?:discord\.gg|discordapp\.com\/invite)\/[^\s]+|https?:\/\/(?:i\.)?imgur\.com\/\S+)/i;

      if (inviteOrImgurRegex.test(targetMsg.content)) return;

      const descriptionFromType = getMessageTypeDescription(targetMsg, fullUrl);
      let description = descriptionFromType || targetMsg.content || '';

      let image = undefined;
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
          name: `${targetMsg.member?.displayName || targetMsg.author.tag}が送信したメッセージ`,
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
      if (
        error.code === 10008 || // Unknown Message
        error.code === 50001 || // Missing Access
        error.code === 50013 // Missing Permissions
      ) {
        return;
      }

      console.error('メッセージリンク処理中にエラー:', error.message);
    }
  },
};
