const { MessageType } = require('discord.js');

const specialTypes = new Set([
  MessageType.GuildBoostTier1,
  MessageType.GuildBoostTier2,
  MessageType.GuildBoostTier3,
  MessageType.GuildBoost,
  MessageType.ChannelFollowAdd,
  MessageType.AutoModerationAction,
  MessageType.ChannelPinnedMessage,
  MessageType.PollResult,
  MessageType.UserJoin,
  MessageType.StageStart,
  MessageType.StageEnd,
]);

/**
 * メッセージタイプや内容に応じて説明文を返す
 * @param {import('discord.js').Message} msg
 * @param {string} url 元メッセージのURL
 * @returns {string|null} 説明文（該当しなければnull）
 */
function getMessageTypeDescription(msg, url) {
  if (specialTypes.has(msg.type)) {
    switch (msg.type) {
      case MessageType.GuildBoostTier1:
        return `🚀 ギルドブースト Tier 1 のメッセージです: ${url}`;
      case MessageType.GuildBoostTier2:
        return `🚀 ギルドブースト Tier 2 のメッセージです: ${url}`;
      case MessageType.GuildBoostTier3:
        return `🚀 ギルドブースト Tier 3 のメッセージです: ${url}`;
      case MessageType.GuildBoost:
        return `🚀 ギルドブーストのメッセージです: ${url}`;
      case MessageType.ChannelFollowAdd:
        return `🔗 チャンネルフォロー追加のメッセージです: ${url}`;
      case MessageType.AutoModerationAction:
        return `🤖 自動モデレーションのアクションメッセージです: ${url}`;
      case MessageType.ChannelPinnedMessage:
        return `📌 チャンネルのピン留めメッセージです: ${url}`;
      case MessageType.PollResult:
        return `📊 投票結果のメッセージです: ${url}`;
      case MessageType.UserJoin:
        return `👤 ユーザー参加メッセージです: ${url}`;
      case MessageType.StageStart:
        return `🎤 ステージ開始メッセージです: ${url}`;
      case MessageType.StageEnd:
        return `🎤 ステージ終了メッセージです: ${url}`;
      default:
        return `特殊なメッセージです: ${url}`;
    }
  }

  if (msg.embeds.length > 0) {
    return `🖼 このメッセージには埋め込みが含まれています: ${url}`;
  }

  if (msg.poll) {
    return `📊 このメッセージは投票です: ${url}`;
  }

  return null;
}

module.exports = { getMessageTypeDescription };
