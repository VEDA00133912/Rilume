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

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('reactionuser')
    .setDescription('指定メッセージのリアクションを取得します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('メッセージリンクを入力してください')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('取得するユーザーの情報（指定なしならユーザー名）')
        .addChoices(
          { name: 'ユーザーID', value: 'id' },
          { name: 'ユーザー名', value: 'name' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const requiredPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    const messageLink = interaction.options.getString('message');
    const type = interaction.options.getString('type') ?? 'name';

    const linkRegex = /discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = messageLink.match(linkRegex);

    if (!match) {
      return interaction.editReply('無効なメッセージリンクです');
    }

    const [, guildId, channelId, messageId] = match;

    let channel;
    try {
      channel = await interaction.client.channels.fetch(channelId);
    } catch {
      return interaction.editReply('チャンネルが取得できませんでした');
    }

    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
      return interaction.editReply('このチャンネルではメッセージを取得できません');
    }

    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch {
      return interaction.editReply('メッセージが見つかりませんでした');
    }

    const reactions = await Promise.all(
      message.reactions.cache.map(async r => await r.fetch())
    );

    if (reactions.length === 0) {
      return interaction.editReply('リアクションがありません');
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('reaction-select')
      .setPlaceholder('リアクションを選択してください')
      .addOptions(
        reactions.map(r => ({
      	  label: r.emoji.id ? r.emoji.name : r.emoji.toString(),
          value: r.emoji.id || r.emoji.name,
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.editReply({
      content: '取得するリアクションを選んでください\n制限時間は2分です',
      components: [row],
    });

    let select;
    try {
      select = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: i => i.user.id === interaction.user.id,
        max: 1,
        time: 120_000,
      });
    } catch {
      return interaction.editReply('選択時間が終了しました');
    }

    const selected = select.values[0];
    const reaction = reactions.find(
      r => r.emoji.id === selected || r.emoji.name === selected
    );

    const users = await reaction.users.fetch();

    if (users.size === 0) {
      return select.update({
        content: `**${reaction.emoji.toString()}**をリアクションしたユーザーはいません`,
        components: [],
      });
    }

    const lines = users.map(u => type === 'id' ? u.id : u.tag);
    const text = lines.join('\n');

    const fileName = `reaction_${reaction.emoji.name}_${messageId}.txt`;
    const attachment = new AttachmentBuilder(Buffer.from(text), { name: fileName });

    await select.update({
      content: `**${reaction.emoji.toString()}**をリアクションしたユーザー一覧です`,
      components: [],
      files: [attachment],
    });
  },
};
