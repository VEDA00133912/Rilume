const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const otoware = require('../../lib/audio/otoware');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('otoware')
    .setDescription('音声ファイルを音割れさせます')
    .addAttachmentOption((option) =>
      option.setName('file').setDescription('音声ファイル').setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('file');
    const allowedExts = ['.mp3', '.ogg', '.m4a', '.wav'];
    const fileInfo = path.parse(attachment.name);

    if (!allowedExts.includes(fileInfo.ext.toLowerCase())) {
      return interaction.editReply(
        '対応しているファイル形式は MP3, OGG, M4A, WAV です',
      );
    }

    const res = await fetch(attachment.url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const wavBuffer = await otoware(buffer, 20);

    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const outPath = path.join(tempDir, `${fileInfo.name}_distort.wav`);

    fs.writeFileSync(outPath, Buffer.from(wavBuffer));

    const file = new AttachmentBuilder(outPath);

    await interaction.editReply({
      content: '音割れ完了しました',
      files: [file],
    });

    try {
      fs.unlinkSync(outPath);
    } catch (err) {
      console.error('Temp file deletion failed:', err.message);
    }
  },
};
