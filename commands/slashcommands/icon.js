const {
  SlashCommandBuilder,
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
  data: new SlashCommandBuilder()
    .setName('icon')
    .setDescription('指定したユーザーのアイコンを表示します')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('アイコンを表示するユーザー')
        .setRequired(false),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    if (!user) {
      return interaction.reply({
        content: 'ユーザーが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });
    }

    const avatarUrl = user.displayAvatarURL({ size: 1024, forceStatic: false });

    const asset = user.avatarDecorationData?.asset;
    const decorationUrl = asset
      ? `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`
      : null;

    const embed = createEmbed(interaction, {
      description: `**${userMention(user.id)} のアイコン**`,
      image: avatarUrl,
    });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('アイコン')
        .setStyle(ButtonStyle.Link)
        .setURL(avatarUrl),
    );

    if (decorationUrl) {
      buttons.addComponents(
        new ButtonBuilder()
          .setLabel('アバターデコレーション')
          .setStyle(ButtonStyle.Link)
          .setURL(decorationUrl),
      );
    }

    await interaction.reply({
      embeds: [embed],
      components: [buttons],
    });
  },
};
