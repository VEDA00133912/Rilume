const {
  SlashCommandBuilder,
  ComponentType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  AttachmentBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { checkBotPermissions } = require('../../utils/checkPermissions');

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.ReadMessageHistory,
];

const LINK_REGEX = /discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('reactionuser')
    .setDescription('指定メッセージのリアクションを取得します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addStringOption((opt) =>
      opt.setName('message').setDescription('メッセージリンクを入力してください').setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('type')
        .setDescription('取得するユーザーの情報（指定なしならユーザー名）')
        .addChoices(
          { name: 'ユーザーID', value: 'id' },
          { name: 'ユーザー名', value: 'name' },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    const messageLink = interaction.options.getString('message');
    const type = interaction.options.getString('type') ?? 'name';

    const match = messageLink.match(LINK_REGEX);
    if (!match) return interaction.editReply('無効なメッセージリンクです');

    const [, , channelId, messageId] = match;

    const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
    if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
      return interaction.editReply('チャンネルが取得できませんでした');
    }

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return interaction.editReply('メッセージが見つかりませんでした');

    const reactions = await Promise.all(message.reactions.cache.map((r) => r.fetch()));
    if (!reactions.length) return interaction.editReply('リアクションがありません');

    await interaction.editReply({
      content: '取得するリアクションを選んでください\n制限時間は2分です',
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('reaction-select')
            .setPlaceholder('リアクションを選択してください')
            .addOptions(
              reactions.map((r) => ({
                label: r.emoji.id ? r.emoji.name : r.emoji.toString(),
                value: r.emoji.id || r.emoji.name,
              })),
            ),
        ),
      ],
    });

    const select = await interaction.channel
      .awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id,
        time: 120_000,
      })
      .catch(() => null);

    if (!select) return interaction.editReply({ content: '選択時間が終了しました', components: [] });

    const selected = select.values[0];
    const reaction = reactions.find((r) => r.emoji.id === selected || r.emoji.name === selected);
    const users = await reaction.users.fetch();

    if (!users.size) {
      return select.update({
        content: `**${reaction.emoji}** をリアクションしたユーザーはいません`,
        components: [],
      });
    }

    const text = users.map((u) => (type === 'id' ? u.id : u.tag)).join('\n');

    await select.update({
      content: `**${reaction.emoji}** をリアクションしたユーザー一覧です`,
      components: [],
      files: [
        new AttachmentBuilder(Buffer.from(text), {
          name: `reaction_${reaction.emoji.name}_${messageId}.txt`,
        }),
      ],
    });
  },
};
