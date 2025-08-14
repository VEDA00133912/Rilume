const { SlashCommandBuilder } = require('discord.js');
const getUserInfo = require('../../lib/info/getUserInfo');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('ユーザー情報を表示します')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('情報を取得するユーザー')
        .setRequired(false),
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const info = await getUserInfo(interaction.guild, user);

    const embed = createEmbed(interaction, {
      title: info.title,
      fields: info.fields,
      thumbnail: info.thumbnail,
      color: info.color,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
