const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmoZip } = require('../../lib/generate/emozip');

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('emozip')
    .setDescription('サーバー内の絵文字をZIPファイルにまとめてダウンロードします')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const result = await createEmoZip(interaction.guild);

    if (!result) {
      return interaction.editReply('ZIPファイルの生成に失敗しました');
    }

    if (typeof result === 'string') {
      return interaction.editReply(result);
    }

    await interaction.editReply({
      content: 'サーバー内の絵文字をZIPファイルにまとめました。以下からダウンロードできます',
      files: [{ attachment: result, name: `${interaction.guild.name}-emojis.zip` }],
    });
  },
};
