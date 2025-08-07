const {
  SlashCommandBuilder,
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
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    if (!user) {
      await interaction.reply({
        content: 'サーバー内にユーザーが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const embed = createEmbed(interaction.client, {
      title: `${userMention(user.id)}のアイコン`,
      image: { url: user.displayAvatarURL({ size: 2048, forceStatic: false }) },
    });

    await interaction.reply({ embeds: [embed] });
  },
};
