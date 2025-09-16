const { MessageType } = require('discord.js');
const { Emojis } = require('./emoji.js');

function getMessageTypeDescription(msg) {
  console.log(Emojis.USER);
  switch (msg.type) {
    case MessageType.Default:
      return null;

    case MessageType.ChannelNameChange:
      return `${Emojis.PEN} チャンネル名が変更されました`;
    case MessageType.ChannelPinnedMessage:
      return `${Emojis.PIN_NEW} メッセージがピン留めされました`;

    case MessageType.UserJoin:
      return `${Emojis.NEW_MEMBER} ユーザーがサーバーに参加しました`;
    case MessageType.GuildBoost:
      return `${Emojis.BOOST_1} サーバーがブーストされました`;
    case MessageType.GuildBoostTier1:
      return `${Emojis.BOOST_LV1} サーバーがlv.1 に到達しました`;
    case MessageType.GuildBoostTier2:
      return `${Emojis.BOOST_LV2} サーバーがlv.2 に到達しました`;
    case MessageType.GuildBoostTier3:
      return `${Emojis.BOOST_LV3} サーバーがlv.3 に到達しました`;

    case MessageType.ChannelFollowAdd:
      return `${Emojis.CHANNEL} フォローチャンネルが追加されました`;
    case MessageType.ThreadCreated:
      return `${Emojis.THREAD} スレッドが作成されました`;
    case MessageType.ChatInputCommand:
      return `${Emojis.COMMANDS} スラッシュコマンドです`;
    case MessageType.ContextMenuCommand:
      return `${Emojis.COMMANDS} コンテキストメニューコマンドです`;

    case MessageType.AutoModerationAction:
      return `${Emojis.AUTOMOD} Automodの実行メッセージ`;
    case MessageType.StageStart:
      return `${Emojis.STAGE} ステージが開始されました`;
    case MessageType.StageEnd:
      return `${Emojis.STAGE_END} ステージが終了しました`;
    case MessageType.PollResult:
      return `${Emojis.POLLS} 終了した投票です`;

    case MessageType.GuildIncidentAlertModeEnabled:
      return `${Emojis.LOCK} セキュリティ措置が有効化されました`;
    case MessageType.GuildIncidentAlertModeDisabled:
      return `${Emojis.UNLOCK} セキュリティ措置が無効化されました`;
    case MessageType.GuildIncidentReportRaid:
      return `${Emojis.RAID} レイド報告メッセージです`;

    default:
      if (msg.embeds.length > 0) {
        return `${Emojis.EMOJI} 埋め込みです`;
      }

      if (msg.poll) {
        return `${Emojis.POLLS} 投票です`;
      }

      return `${Emojis.SEARCH} 特殊なメッセージです`;
  }
}

module.exports = { getMessageTypeDescription };
