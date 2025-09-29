const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const {
  SlashCommandBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const otoware = require('../../lib/audio/otoware');
const MAX_FILE_SIZE = 8 * 1024 * 1024;

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('otoware')
    .setDescription('音声ファイルを音割れさせます')
    .addAttachmentOption((option) =>
      option.setName('file').setDescription('音声ファイル').setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('file');
    const allowedExts = ['.mp3', '.ogg', '.wav'];
    const fileInfo = path.parse(attachment.name);

    if (!allowedExts.includes(fileInfo.ext.toLowerCase())) {
      return interaction.editReply(
        '対応しているファイル形式は MP3, OGG, WAV です',
      );
    }

    if (attachment.size > MAX_FILE_SIZE) {
      return interaction.editReply(
        '8MB以下のファイルをアップロードしてください',
      );
    }

    const res = await fetch(attachment.url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const wavBuffer = await otoware(buffer, 20);

    // OSの一時ディレクトリに保存（ユニークなファイル名を生成）
    const tempDir = os.tmpdir();
    const uniqueId = crypto.randomUUID();
    const outPath = path.join(
      tempDir,
      `${fileInfo.name}_${uniqueId}_distort.wav`,
    );

    fs.writeFileSync(outPath, Buffer.from(wavBuffer));

    const file = new AttachmentBuilder(outPath, {
      name: `${fileInfo.name}_distort.wav`, // ユーザーに見えるファイル名
    });

    await interaction.editReply({
      content: '音割れ完了しました',
      files: [file],
    });

    // 少し待ってから削除
    setTimeout(() => {
      try {
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      } catch (err) {
        console.error('Temp file deletion failed:', err.message);
      }
    }, 5000);
  },
};
