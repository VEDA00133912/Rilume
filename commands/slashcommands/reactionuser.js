const {
  SlashCommandBuilder,
  AttachmentBuilder,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');
const { checkBotPermissions } = require('../../utils/checkPermissions');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('reactionusers')
    .setDescription('指定したメッセージのリアクションユーザーを取得します')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('対象のメッセージがあるチャンネル')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('message_id')
        .setDescription('対象のメッセージID')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('対象の絵文字(カスタム絵文字OK)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('ユーザー名かIDを選択')
        .setRequired(true)
        .addChoices(
          { name: 'ユーザー名', value: 'username' },
          { name: 'ユーザーID', value: 'id' },
        ),
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const messageId = interaction.options.getString('message_id');
    const emojiInputRaw = interaction.options.getString('emoji');
    const type = interaction.options.getString('type');

    // 前後の空白を削除
    const emojiInput = emojiInputRaw.trim();

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const requiredPermissions = [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.ReadMessageHistory,
    ];
    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    let message;
    try {
      message = await channel.messages.fetch(messageId);
    } catch {
      return interaction.editReply('メッセージが見つかりませんでした');
    }

    let emojiKey = emojiInput;
    const customEmojiMatch = emojiInput.match(/^<a?:\w+:(\d+)>$/);
    if (customEmojiMatch) emojiKey = customEmojiMatch[1];

    const reaction =
      message.reactions.cache.get(emojiKey) ||
      message.reactions.cache.find((r) => r.emoji.toString() === emojiInput);

    if (!reaction) {
      return interaction.editReply('その絵文字のリアクションは見つかりません');
    }

    let allUsers = [];
    let lastId;

    while (true) {
      const fetched = await reaction.users.fetch({ limit: 100, after: lastId });
      if (fetched.size === 0) break;

      allUsers = allUsers.concat(fetched.map((u) => u));
      lastId = fetched.last().id;
    }

    if (allUsers.length === 0) {
      return interaction.editReply('リアクションしているユーザーはいません');
    }

    const list = allUsers.map((u) => (type === 'username' ? u.username : u.id));
    const content = list.join('\n');
    const file = new AttachmentBuilder(Buffer.from(content, 'utf-8'), {
      name: 'reactionusers.txt',
    });

    return interaction.editReply({ files: [file] });
  },
};
