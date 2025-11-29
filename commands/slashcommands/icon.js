const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  userMention,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('icon')
    .setDescription('指定したユーザーのアイコンを表示します')
    .addUserOption((opt) => opt.setName('user').setDescription('アイコンを表示するユーザー'))
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 1024, forceStatic: false });

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
