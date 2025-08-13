const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  userMention,
  MessageFlags,
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
      await interaction.reply({
        content: 'ユーザーが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const icon = user.displayAvatarURL({ size: 2048, forceStatic: false });
    const embed = createEmbed(interaction, {
      description: `**${userMention(user.id)} のアイコン**`,
      image: icon,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
