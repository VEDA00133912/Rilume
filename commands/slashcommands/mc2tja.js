const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const AdmZip = require('adm-zip');
const { MCReader } = require('../../lib/mc2tja/mcreader');
const { mc2tja } = require('../../lib/mc2tja/mc2tja');
const { createEmbed } = require('../../utils/createEmbed');

const MAX_FILE_SIZE = 8 * 1024 * 1024;

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('mc2tja')
    .setDescription('MC・MCZ(Malodyの譜面ファイル)をTJAに変換します')
    .addAttachmentOption((option) =>
      option.setName('file').setDescription('変換するMCまたはMCZファイル').setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const attachment = interaction.options.getAttachment('file');

    if (!attachment) return replyError(interaction, 'ファイルが添付されていません');

    const name = attachment.name.toLowerCase();

    if (!name.endsWith('.mc') && !name.endsWith('.mcz'))
      return replyError(interaction, '.mcまたは.mczファイルのみ対応しています');

    if (attachment.size > MAX_FILE_SIZE) {
      return replyError(interaction, '8MB以下のファイルをアップロードしてください');
    }

    await interaction.editReply({ content: 'ファイルをダウンロード中...' });
    const fileBuffer = await downloadFile(attachment.url);

    let mcContent, originalFilename;
    let attachments = [];
    const mcReader = new MCReader();
    const converter = new mc2tja();

    if (name.endsWith('.mcz')) {
      const extractResult = await extractMCZWithExtras(fileBuffer, interaction);

      mcContent = extractResult.mcContent;
      originalFilename = extractResult.mcFilename;

      mcReader.parse(mcContent);
      mcReader.filename = originalFilename;

      if (!converter.convert(mcReader)) {
        return replyError(interaction, '変換に失敗しました');
      }

      const tjaFilename = path.basename(originalFilename).replace(/\.mc$/i, '.tja');
      const tjaFilePath = writeTempTJA(tjaFilename, converter.generated);

      attachments.push(new AttachmentBuilder(tjaFilePath, { name: tjaFilename }));

      if (extractResult.otherFiles.length > 0) {
        const zip = new AdmZip();

        zip.addLocalFile(tjaFilePath);

        for (const file of extractResult.otherFiles) {
          zip.addFile(file.filename, file.buffer);
        }

        // ユニークなzipファイルパス
        const uniqueId = crypto.randomUUID();
        const zipFilename = `${path.basename(attachment.name, path.extname(attachment.name))}_${uniqueId}_tja.zip`;
        const zipFilePath = path.join(os.tmpdir(), zipFilename);

        zip.writeZip(zipFilePath);

        attachments = [new AttachmentBuilder(zipFilePath, { name: zipFilename })];

        setTimeout(() => {
          safeUnlink(tjaFilePath);
          safeUnlink(zipFilePath);
        }, 5000);
      } else {
        setTimeout(() => safeUnlink(tjaFilePath), 5000);
      }
    } else {
      mcContent = fileBuffer.toString('utf8');
      originalFilename = attachment.name;

      mcReader.parse(mcContent);
      mcReader.filename = originalFilename;

      if (!converter.convert(mcReader)) {
        return replyError(interaction, '変換に失敗しました');
      }

      const tjaFilename = path.basename(originalFilename).replace(/\.mc$/i, '.tja');
      const tjaFilePath = writeTempTJA(tjaFilename, converter.generated);

      attachments.push(new AttachmentBuilder(tjaFilePath, { name: tjaFilename }));

      setTimeout(() => safeUnlink(tjaFilePath), 5000);
    }

    const footerText = name.endsWith('.mcz')
      ? `${attachment.name} → ${path.basename(attachments[0].name)}`
      : attachment.name;

    const embed = createFileInfoEmbed(interaction, mcReader, converter, footerText);

    await interaction.editReply({
      content: '変換が完了しました！',
      embeds: [embed],
      files: attachments,
    });
  },
};

async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function extractMCZWithExtras(buffer, interaction) {
  await interaction.editReply({ content: 'MCZファイルを展開中...' });
  const zip = new AdmZip(buffer);

  const mcEntry = zip.getEntries().find((e) => e.entryName.toLowerCase().endsWith('.mc') && !e.isDirectory);

  if (!mcEntry) throw new Error('.mcファイルが見つかりませんでした。');

  const mcContent = mcEntry.getData().toString('utf8');
  const mcFilename = mcEntry.entryName;

  const otherFiles = zip
    .getEntries()
    .filter((e) => !e.isDirectory && e.entryName !== mcFilename)
    .map((e) => ({
      filename: path.basename(e.entryName),
      buffer: e.getData(),
    }));

  return { mcContent, mcFilename, otherFiles };
}

function writeTempTJA(filename, content) {
  const uniqueId = crypto.randomUUID();
  const filePath = path.join(os.tmpdir(), `${uniqueId}_${filename}`);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Temp file deletion failed:', err.message);
  }
}

function replyError(interaction, message) {
  return interaction.editReply({ content: message });
}

function createFileInfoEmbed(client, mcReader, converter, footer) {
  let course = 'おに';
  let level = 10;

  try {
    const version = mcReader.meta?.version;
    if (version) {
      course = converter.getCourseFromName('command', version);
      level = converter.getStarFromVersionText(version);
    }
  } catch (e) {
    console.error('Error getting file info:', e.message);
  }

  const fileInfo = {
    title: mcReader.meta?.song?.title || 'Unknown',
    artist: mcReader.meta?.song?.artist || 'Unknown',
    course,
    level,
    noteCount: mcReader.note?.length || 0,
    bpm: Math.round(mcReader.initTime?.bpm || 120),
  };

  return createEmbed(client, {
    fields: [
      { name: '楽曲名', value: fileInfo.title },
      { name: 'アーティスト名', value: fileInfo.artist },
      { name: '難易度', value: `${fileInfo.course} (${fileInfo.level}★)`, inline: true },
      { name: 'BPM', value: String(fileInfo.bpm), inline: true },
      { name: 'ノーツ数', value: String(fileInfo.noteCount), inline: true },
    ],
    footer,
  });
}
