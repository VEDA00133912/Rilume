const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('BOTの情報とサポートリンク等を表示します')
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
      InteractionContextType.BotDM,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const client = interaction.client;
    const creatorId = '1317692759448223808';

    const embed = createEmbed(interaction, {
      title: '{ Rilume }ヘルプ',
      description: 'このBOTの情報と各種リンクをまとめています',
      fields: [
        {
          name: 'サポートサーバー',
          value: '[参加はこちら](https://discord.gg/xxxxxx)',
        },
        {
          name: '作成者',
          value: `<@${creatorId}> (${client.users.cache.get(creatorId)?.username || '不明'})`,
        },
        {
          name: '公式サイト',
          value: '[サイトはこちら](https://example.com)',
        },
        {
          name: '稼働サーバー数',
          value: `${client.guilds.cache.size} サーバーで稼働中`,
        },
        {
          name: 'コマンド一覧',
          value: '[コマンド一覧はこちら](https://example.com/commands)',
        },
        {
          name: '設定用コマンド',
          value:
            '**/setting-impersonate** webhook関連の設定\n**/setting-expand** メッセージ自動展開の設定',
        },
      ],
    });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
