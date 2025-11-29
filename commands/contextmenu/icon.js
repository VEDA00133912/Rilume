const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ApplicationIntegrationType,
  userMention,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new ContextMenuCommandBuilder()
    .setName('アイコン表示')
    .setType(ApplicationCommandType.User)
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const user = interaction.targetUser;

    if (!user) {
      await interaction.reply({ content: 'ユーザーが見つかりませんでした', flags: MessageFlags.Ephemeral,});
      return;
    }

    const avatarUrl = user.displayAvatarURL({ size: 2048, forceStatic: false });

    const buttons = [
      new ButtonBuilder().setLabel('アイコン').setStyle(ButtonStyle.Link).setURL(avatarUrl),
    ];

    const decoAsset = user.avatarDecorationData?.asset;
    if (decoAsset) {
      buttons.push(
        new ButtonBuilder()
          .setLabel('アバターデコレーション')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://cdn.discordapp.com/avatar-decoration-presets/${decoAsset}.png`),
      );
    }

    await interaction.reply({
      embeds: [
        createEmbed(interaction, {
          description: `**${userMention(user.id)} のアイコン**`,
          image: avatarUrl,
        }),
      ],
      components: [new ActionRowBuilder().addComponents(buttons)],
    });
  },
};
