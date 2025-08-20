const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  InteractionContextType,
  ApplicationIntegrationType,
  AttachmentBuilder,
  MessageFlags,
  userMention,
} = require('discord.js');
const { generateIeiImage } = require('../../lib/iei/generateIei');
const { downloadImage } = require('../../lib/iei/downloadIcon');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new ContextMenuCommandBuilder()
    .setName('遺影画像を生成')
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions()
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    await interaction.deferReply();

    const user = interaction.targetUser;

    if (!user) {
      await interaction.reply({
        content: 'ユーザーが見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

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
