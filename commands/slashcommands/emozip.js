const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmoZip } = require('../../lib/emoZip/emozip');

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('emozip')
    .setDescription(
      'サーバー内の絵文字をZIPファイルにまとめてダウンロードします',
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const zipFilePath = await createEmoZip(interaction.guild);

    if (!zipFilePath) {
      return await interaction.editReply('zipファイルの生成に失敗しました');
    }

    if (
      typeof zipFilePath === 'string' &&
      zipFilePath.includes('絵文字がありません')
    ) {
      return await interaction.editReply(zipFilePath);
    }

    const attachment = {
      files: [
        {
          attachment: zipFilePath,
          name: interaction.guild.name + '-emojis.zip',
        },
      ],
    };

    await interaction.editReply({
      content:
        'サーバー内の絵文字をZIPファイルにまとめました。以下からダウンロードできます',
      ...attachment,
    });
  },
};
