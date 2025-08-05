const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')
const { MCReader } = require('../lib/mc2tja/mcreader')
const { mc2tja } = require('../lib/mc2tja/mc2tja')

const MAX_FILE_SIZE = 8 * 1024 * 1024
const TEMP_DIR = path.join(__dirname, '..', 'temp')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mc2tja')
    .setDescription('MC・MCZ(Malodyの譜面ファイル)をTJAに変換します')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('変換するMCまたはMCZファイル')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const attachment = interaction.options.getAttachment('file')
    if (!attachment) return replyError(interaction, 'ファイルが添付されていません')

    const name = attachment.name.toLowerCase()
    if (!name.endsWith('.mc') && !name.endsWith('.mcz'))
      return replyError(interaction, '.mcまたは.mczファイルのみ対応しています')

    if (attachment.size > MAX_FILE_SIZE) {
      return replyError(interaction, '8MB以下のファイルをアップロードしてください')
    }

    await interaction.editReply({ content: 'ファイルをダウンロード中...' })
    const fileBuffer = await downloadFile(attachment.url)
    const { content: mcContent, filename: originalFilename } = name.endsWith('.mcz')
      ? await extractMCZ(fileBuffer, interaction)
      : { content: fileBuffer.toString('utf8'), filename: attachment.name }

    const mcReader = new MCReader()
    mcReader.parse(mcContent)
    mcReader.filename = originalFilename

    const converter = new mc2tja()
    if (!converter.convert(mcReader)) {
      return replyError(interaction, '変換に失敗しました')
    }

    const tjaFilename = path.basename(originalFilename).replace(/\.mc$/i, '.tja')
    const tjaFilePath = writeTempTJA(tjaFilename, converter.generated)

    const fileInfo = getFileInfo(mcReader, converter)
    const tjaAttachment = new AttachmentBuilder(tjaFilePath, { name: tjaFilename })

    const embed = new EmbedBuilder()
      .addFields(
        { name: '元ファイル', value: `${attachment.name}${name.endsWith('.mcz') ? ` → ${originalFilename}` : ''}` },
        { name: '変換後ファイル', value: tjaFilename },
        { name: '楽曲名', value: fileInfo.title },
        { name: 'アーティスト名', value: fileInfo.artist },
        { name: '難易度', value: `${fileInfo.course} (${fileInfo.level}★)` },
        { name: 'BPM', value: String(fileInfo.bpm) },
        { name: 'ノーツ数', value: String(fileInfo.noteCount) }
      )
      .setColor('#f34728')
      .setTimestamp()

    await interaction.editReply({
      content: '変換が完了しました！',
      embeds: [embed],
      files: [tjaAttachment],
    })

    // tjaファイルの自動削除
    setTimeout(() => {
      if (fs.existsSync(tjaFilePath)) fs.unlinkSync(tjaFilePath)
    }, 5000)
  },
}

async function downloadFile(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

async function extractMCZ(buffer, interaction) {
  await interaction.editReply({ content: 'MCZファイルを展開中...' })
  const zip = new AdmZip(buffer)
  const mcEntry = zip.getEntries().find(e => e.entryName.toLowerCase().endsWith('.mc') && !e.isDirectory)
  if (!mcEntry) throw new Error('.mcファイルが見つかりませんでした。')
  return { content: mcEntry.getData().toString('utf8'), filename: mcEntry.entryName }
}

function writeTempTJA(filename, content) {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true })
  const filePath = path.join(TEMP_DIR, filename)
  fs.writeFileSync(filePath, content, 'utf8')
  return filePath
}

function replyError(interaction, message) {
  return interaction.editReply({ content: message })
}

function getFileInfo(mcReader, converter) {
  const courseNames = ['かんたん', 'ふつう', 'むずかしい', 'おに']
  let course = 'おに', level = 10

  try {
    const version = mcReader.meta?.version
    if (version) {
      const courseIndex = converter.getCourseFromName(version)
      const levelNum = converter.getLevelFromName(version)
      if (courseIndex >= 0 && courseIndex < courseNames.length) course = courseNames[courseIndex]
      if (levelNum > 0) level = converter.getStarFromCourseLevel(courseIndex, levelNum)
    }
  } catch (e) {
    console.error('Error getting file info:', e)
  }

  return {
    title: mcReader.meta?.song?.title || 'Unknown',
    artist: mcReader.meta?.song?.artist || 'Unknown',
    course,
    level,
    noteCount: mcReader.note?.length || 0,
    bpm: Math.round(mcReader.initTime?.bpm || 120),
  }
}