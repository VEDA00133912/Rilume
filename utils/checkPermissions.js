const { PermissionFlagsBits, Colors, MessageFlags } = require('discord.js');
const { createEmbed } = require('./createEmbed');

const permissionNames = {
  [PermissionFlagsBits.ViewChannel]: 'チャンネルを見る',
  [PermissionFlagsBits.ManageChannels]: 'チャンネルの管理',
  [PermissionFlagsBits.ManageRoles]: 'ロールの管理',
  [PermissionFlagsBits.CreateGuildExpressions]: 'エクスプレッションを作成',
  [PermissionFlagsBits.ManageGuildExpressions]: '絵文字の管理',
  [PermissionFlagsBits.ViewAuditLog]: '監査ログを表示',
  [PermissionFlagsBits.ViewGuildInsights]: 'サーバーインサイトを見る',
  [PermissionFlagsBits.ManageWebhooks]: 'ウェブフックの管理',
  [PermissionFlagsBits.ManageGuild]: 'サーバーの管理',
  [PermissionFlagsBits.CreateInstantInvite]: '招待を作成',
  [PermissionFlagsBits.ChangeNickname]: 'ニックネームの変更',
  [PermissionFlagsBits.ManageNicknames]: 'ニックネームの管理',
  [PermissionFlagsBits.KickMembers]: 'メンバーをキック',
  [PermissionFlagsBits.BanMembers]: 'メンバーをBAN',
  [PermissionFlagsBits.ModerateMembers]: 'メンバーをタイムアウト',
  [PermissionFlagsBits.SendMessages]: 'メッセージを送信',
  [PermissionFlagsBits.SendMessagesInThreads]: 'スレッドでメッセージを送信',
  [PermissionFlagsBits.CreatePublicThreads]: '公開スレッドを作成',
  [PermissionFlagsBits.CreatePrivateThreads]: 'プライベートスレッドを作成',
  [PermissionFlagsBits.EmbedLinks]: '埋め込みリンク',
  [PermissionFlagsBits.AttachFiles]: 'ファイルを添付',
  [PermissionFlagsBits.AddReactions]: 'リアクションを追加',
  [PermissionFlagsBits.UseExternalEmojis]: '外部の絵文字を使用する',
  [PermissionFlagsBits.UseExternalStickers]: '外部のスタンプを使用する',
  [PermissionFlagsBits.MentionEveryone]: '@everyone、@here、すべてのロールにメンション',
  [PermissionFlagsBits.ManageMessages]: 'メッセージの管理',
  [PermissionFlagsBits.ManageThreads]: 'スレッドの管理',
  [PermissionFlagsBits.ReadMessageHistory]: 'メッセージ履歴を読む',
  [PermissionFlagsBits.SendTTSMessages]: 'テキスト読み上げメッセージを送信する',
  [PermissionFlagsBits.SendVoiceMessages]: 'ボイスメッセージを送信する',
  [PermissionFlagsBits.SendPolls]: '投票の作成',
  [PermissionFlagsBits.Connect]: '接続',
  [PermissionFlagsBits.Speak]: '発言',
  [PermissionFlagsBits.Stream]: 'WEBカメラ',
  [PermissionFlagsBits.UseSoundboard]: 'サウンドボードを使用',
  [PermissionFlagsBits.UseExternalSounds]: '外部のサウンドを使用',
  [PermissionFlagsBits.UseVAD]: '音声検出を使用',
  [PermissionFlagsBits.PrioritySpeaker]: '優先スピーカー',
  [PermissionFlagsBits.MuteMembers]: 'メンバーをミュート',
  [PermissionFlagsBits.DeafenMembers]: 'メンバーのスピーカーをミュート',
  [PermissionFlagsBits.MoveMembers]: 'メンバーを移動',
  [PermissionFlagsBits.UseApplicationCommands]: 'アプリコマンドを使う',
  [PermissionFlagsBits.UseEmbeddedActivities]: 'ユーザーアクティビティ',
  [PermissionFlagsBits.UseExternalApps]: '外部のアプリを使用',
  [PermissionFlagsBits.RequestToSpeak]: 'スピーカー参加をリクエスト',
  [PermissionFlagsBits.CreateEvents]: 'イベントを作成',
  [PermissionFlagsBits.ManageEvents]: 'イベントの管理',
  [PermissionFlagsBits.Administrator]: '管理者',
};

/**
 * Botの必要権限をチェックして、不足していたらエラー返信します。
 * @param {CommandInteraction} interaction
 * @param {Array<bigint>} requiredPermissions
 * @returns {Promise<boolean>} すべてあるならtrue、なければfalse
 */

async function checkBotPermissions(interaction, requiredPermissions) {
  const botPermissions = interaction.channel.permissionsFor(interaction.client.user);
  const missing = requiredPermissions.filter(p => !botPermissions?.has(p));

  if (missing.length > 0) {
    const missingNames = missing.map(p => permissionNames[p] || `不明な権限 (${p.toString()})`);

    await interaction.reply({
      embeds: [
        createEmbed(interaction.client, {
          title: '権限が不足しています',
          description: `Bot に以下の権限がありません\n\`\`\`\n・${missingNames.join('\n・')}\n\`\`\``,
          color: Colors.Red
        })
      ],
      flags: MessageFlags.Ephemeral
    });

    return false;
  }

  return true;
}

module.exports = { checkBotPermissions };