const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  AttachmentBuilder,
  userMention,
} = require('discord.js');
const { generateIeiImage } = require('../../lib/iei/generateIei');
const { downloadImage } = require('../../lib/iei/downloadIcon');
const { createEmbed } = require('../../utils/createEmbed');

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
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('target') || interaction.user;
    const avatarUrl = user.displayAvatarURL({
      extension: 'png',
      size: 512,
      forceStatic: true,
    });
    const avatarBuffer = await downloadImage(avatarUrl);

    const image = await generateIeiImage(avatarBuffer);
    const attachment = new AttachmentBuilder(image, { name: 'iei.png' });

    const embed = createEmbed(interaction, {
      description: `${userMention(user.id)}が死亡しました`,
      image: 'attachment://iei.png',
      footer: `${user.username} died...💀`,
    });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  },
};
