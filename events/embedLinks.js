const { Events, ChannelType } = require('discord.js');
const { createEmbed } = require('../utils/createEmbed');
const invalidContentChecks = require('../utils/invalidContentRegex');
const { getMessageTypeDescription } = require('../utils/getMessageTypeDescription');
const { checkBlacklist, handleSpamCheck } = require('../utils/blackList');
const Expand = require('../models/expandGuild');

const MAX_LENGTH = 400;
const LINK_REGEX = /https:\/\/(?:canary\.|ptb\.)?discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
const IGNORED_ERRORS = new Set([10008, 50001, 50013]);

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot || !message.guild || message.channel.type !== ChannelType.GuildText) return;

    const settings = await Expand.findOne({ guildId: message.guild.id });
    if (settings?.expand === false) return;

    if (await checkBlacklist(message.author.id)) return;

    const match = message.content.match(LINK_REGEX);
    if (!match) return;

    if (await handleSpamCheck(message.author.id)) return;

    const [fullUrl, , channelId, messageId] = match;

    try {
      const channel = await message.client.channels.fetch(channelId);
      if (!channel) return;

      const targetMsg = await channel.messages.fetch(messageId);

      if (invalidContentChecks.some((c) => c.regex.test(targetMsg.content))) return;

      let description = getMessageTypeDescription(targetMsg, fullUrl) || targetMsg.content || '';
      let image;

      const { attachments } = targetMsg;

      if (attachments.size === 1) {
        const first = attachments.first();
        if (first?.contentType?.startsWith('image/')) {
          image = first.proxyURL;
        } else {
          description += `\n📎 添付ファイル: ${first.name || 'ファイル'}`;
        }
      } else if (attachments.size > 1) {
        description += `\n📎 添付ファイルが${attachments.size}件あります`;
      }

      if (description.length > MAX_LENGTH) {
        description = `${description.slice(0, MAX_LENGTH - 3)}...`;
      }

      await message.reply({
        embeds: [
          createEmbed(message.client, {
            author: {
              name: targetMsg.member?.displayName || targetMsg.author.tag,
              iconURL: targetMsg.author.displayAvatarURL({ size: 64 }),
            },
            footer: `sent by ${targetMsg.author.tag}`,
            description,
            image,
          }),
        ],
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      if (!IGNORED_ERRORS.has(err.code)) {
        console.error('メッセージリンク処理中にエラー:', err.message);
      }
    }
  },
};
