const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { setTimer } = require('../../lib/timer/setTimer');
const { hasTimer } = require('../../lib/timer/storage');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('タイマーをセットします')
    .addIntegerOption((option) =>
      option
        .setName('minutes')
        .setDescription('タイマーの分数')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(60),
    )
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('タイマーの秒数')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(60),
    ),

  async execute(interaction) {
    if (await hasTimer(interaction.user.id)) {
      return interaction.reply({
        content: 'すでにタイマーがセットされています',
        flags: MessageFlags.Ephemeral,
      });
    }

    const minutes = interaction.options.getInteger('minutes') || 0;
    const seconds = interaction.options.getInteger('seconds') || 10;
    const totalSeconds = minutes * 60 + seconds;

    await interaction.reply({
      content: `タイマーを${minutes}分${seconds}秒にセットしました。\nタイマーが終了すると通知します`,
    });

    setTimer(interaction, totalSeconds); // データの保存とタイマー開始
  },
};
