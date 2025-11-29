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
    .addUserOption((opt) =>
      opt.setName('target').setDescription('遺影にするユーザー'),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.options.getUser('target') ?? interaction.user;

    const avatarBuffer = await downloadImage(
      user.displayAvatarURL({ extension: 'png', size: 512, forceStatic: true }),
    );

    const image = await generateIeiImage(avatarBuffer);

    await interaction.editReply({
      embeds: [
        createEmbed(interaction, {
          description: `${userMention(user.id)}が死亡しました`,
          image: 'attachment://iei.png',
          footer: `${user.username} died...💀`,
        }),
      ],
      files: [new AttachmentBuilder(image, { name: 'iei.png' })],
    });
  },
};
