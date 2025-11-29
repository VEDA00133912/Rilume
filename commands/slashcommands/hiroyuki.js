const {
  SlashCommandBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { getWavBuffer } = require('../../lib/audio/coefont');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('hiroyuki')
    .setDescription('テキストをひろゆきのボイスに変換します')
    .addStringOption((opt) =>
      opt
        .setName('text')
        .setDescription('音声にするテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),
  async execute(interaction) {
    const text = interaction.options.getString('text');

    await interaction.deferReply();

    const wavBuffer = await getWavBuffer(text, 'hiroyuki');
    const attachment = new AttachmentBuilder(wavBuffer, {
      name: `hiroyuki_${text}.wav`,
    });

    await interaction.editReply({
      content: '変換が完了しました',
      files: [attachment],
    });
  },
};
