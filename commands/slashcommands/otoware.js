const {
  SlashCommandBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const otoware = require('../../lib/audio/otoware');

const ALLOWED_EXTS = new Set(['.mp3', '.ogg', '.wav']);
const MAX_FILE_SIZE = 8 * 1024 * 1024;

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('otoware')
    .setDescription('音声ファイルを音割れさせます')
    .addAttachmentOption((opt) =>
      opt.setName('file').setDescription('音声ファイル').setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('file');
    const ext = attachment.name.slice(attachment.name.lastIndexOf('.')).toLowerCase();
    const baseName = attachment.name.slice(0, attachment.name.lastIndexOf('.'));

    if (!ALLOWED_EXTS.has(ext)) {
      return interaction.editReply('対応しているファイル形式は MP3, OGG, WAV です');
    }

    if (attachment.size > MAX_FILE_SIZE) {
      return interaction.editReply('8MB以下のファイルをアップロードしてください');
    }

    const res = await fetch(attachment.url);
    const buffer = Buffer.from(await res.arrayBuffer());

    const wavBuffer = await otoware(buffer, 20);

    await interaction.editReply({
      content: '音割れ完了しました',
      files: [new AttachmentBuilder(Buffer.from(wavBuffer), { name: `${baseName}_distort.wav` })],
    });
  },
};
