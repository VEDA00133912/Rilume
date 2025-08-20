const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ApplicationIntegrationType,
  userMention,
  MessageFlags,
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
      await interaction.reply({
        content: 'ユーザーが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const embed = createEmbed(interaction, {
      description: `**${userMention(user.id)} のアイコン**`,
      image: user.displayAvatarURL({ size: 2048, forceStatic: false }),
    });

    await interaction.reply({ embeds: [embed] });
  },
};
