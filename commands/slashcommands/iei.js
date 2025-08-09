const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { generateIeiImage } = require('../../lib/iei/generateIei');
const { downloadImage } = require('../../lib/iei/downloadIcon');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('iei')
    .setDescription('遺影画像を生成します')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('遺影にするユーザー')
        .setRequired(false),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('target') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 512 });
    const avatarBuffer = await downloadImage(avatarUrl);

    const image = await generateIeiImage(avatarBuffer);
    const attachment = new AttachmentBuilder(image, { name: 'iei.png' });

    await interaction.editReply({ files: [attachment] });
  },
};
