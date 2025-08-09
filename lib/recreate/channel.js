const { channelMention, userMention } = require('discord.js');

/**
 * 指定チャンネルを再作成する
 * @param {import('discord.js').GuildChannel} channel
 * @param {import('discord.js').User} executor
 * @returns {Promise<import('discord.js').GuildChannel>} 新チャンネル
 */
async function recreateChannel(channel, executor) {
  const newChannel = await channel.clone({
    reason: `Recreation command by ${executor.tag}`,
  });

  await Promise.allSettled([
    newChannel.setPosition(channel.position).catch(() => {}),
    channel.delete(`Recreation command by ${executor.tag}`),
    newChannel.send(
      `${channelMention(newChannel.id)} の再作成が完了しました！\n（実行者: ${userMention(executor.id)}）`,
    ),
  ]);

  return newChannel;
}

module.exports = { recreateChannel };
