const fs = require('node:fs');
const { join, basename, extname } = require('node:path');
const { tmpdir } = require('node:os');
const { randomUUID } = require('node:crypto');
const {
  SlashCommandBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const AdmZip = require('adm-zip');
const { MCReader } = require('../../lib/generate/mcreader');
const { mc2tja } = require('../../lib/generate/mc2tja');
const { createEmbed } = require('../../utils/createEmbed');

const MAX_FILE_SIZE = 8 * 1024 * 1024;

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('mc2tja')
    .setDescription('MC・MCZ(Malodyの譜面ファイル)をTJAに変換します')
    .addAttachmentOption((opt) =>
      opt.setName('file').setDescription('変換するMCまたはMCZファイル').setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('file');
    const name = attachment.name.toLowerCase();

    if (!name.endsWith('.mc') && !name.endsWith('.mcz')) {
      return interaction.editReply('.mcまたは.mczファイルのみ対応しています');
    }

    if (attachment.size > MAX_FILE_SIZE) {
      return interaction.editReply('8MB以下のファイルをアップロードしてください');
    }

    await interaction.editReply('ファイルをダウンロード中...');

    const res = await fetch(attachment.url);
    const fileBuffer = Buffer.from(await res.arrayBuffer());

    const mcReader = new MCReader();
    const converter = new mc2tja();
    const tempFiles = [];

    try {
      let mcContent, mcFilename, otherFiles = [];

      if (name.endsWith('.mcz')) {
        await interaction.editReply('MCZファイルを展開中...');
        const zip = new AdmZip(fileBuffer);
        const mcEntry = zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith('.mc') && !e.isDirectory);

        if (!mcEntry) return interaction.editReply('.mcファイルが見つかりませんでした');

        mcContent = mcEntry.getData().toString('utf8');
        mcFilename = mcEntry.entryName;
        otherFiles = zip
          .getEntries()
          .filter((e) => !e.isDirectory && e.entryName !== mcFilename)
          .map((e) => ({ filename: basename(e.entryName), buffer: e.getData() }));
      } else {
        mcContent = fileBuffer.toString('utf8');
        mcFilename = attachment.name;
      }

      mcReader.parse(mcContent);
      mcReader.filename = mcFilename;

      if (!converter.convert(mcReader)) {
        return interaction.editReply('変換に失敗しました');
      }

      const tjaFilename = basename(mcFilename).replace(/\.mc$/i, '.tja');
      const tjaPath = join(tmpdir(), `${randomUUID()}_${tjaFilename}`);
      fs.writeFileSync(tjaPath, converter.generated, 'utf8');
      tempFiles.push(tjaPath);

      let attachments;

      if (otherFiles.length > 0) {
        const zip = new AdmZip();
        zip.addLocalFile(tjaPath);
        otherFiles.forEach((f) => zip.addFile(f.filename, f.buffer));

        const zipPath = join(tmpdir(), `${basename(attachment.name, extname(attachment.name))}_${randomUUID()}_tja.zip`);
        zip.writeZip(zipPath);
        tempFiles.push(zipPath);

        attachments = [new AttachmentBuilder(zipPath, { name: basename(zipPath).replace(/_[^_]+_tja\.zip$/, '_tja.zip') })];
      } else {
        attachments = [new AttachmentBuilder(tjaPath, { name: tjaFilename })];
      }

      const embed = createFileInfoEmbed(interaction, mcReader, converter, `${attachment.name} → ${attachments[0].name}`);

      await interaction.editReply({ content: '変換が完了しました！', embeds: [embed], files: attachments });
    } finally {
      setTimeout(() => tempFiles.forEach((f) => fs.unlink(f, () => {})), 5000);
    }
  },
};

function createFileInfoEmbed(interaction, mcReader, converter, footer) {
  const version = mcReader.meta?.version;
  const course = version ? converter.getCourseFromName('command', version) : 'おに';
  const level = version ? converter.getStarFromVersionText(version) : 10;

  return createEmbed(interaction, {
    fields: [
      { name: '楽曲名', value: mcReader.meta?.song?.title || 'Unknown' },
      { name: 'アーティスト名', value: mcReader.meta?.song?.artist || 'Unknown' },
      { name: '難易度', value: `${course} (${level}★)`, inline: true },
      { name: 'BPM', value: String(Math.round(mcReader.initTime?.bpm || 120)), inline: true },
      { name: 'ノーツ数', value: String(mcReader.note?.length || 0), inline: true },
    ],
    footer,
  });
}
