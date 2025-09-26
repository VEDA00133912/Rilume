const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
  PermissionFlagsBits,
} = require('discord.js');
const { setTimer } = require('../../lib/timer/setTimer');
const { hasTimer } = require('../../lib/timer/storage');
const { checkBotPermissions } = require('../../utils/checkPermissions');

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
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const requiredPermissions = [
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ViewChannel,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    if (await hasTimer(interaction.user.id)) {
      return interaction.reply({
        content: 'すでにタイマーがセットされています',
        flags: MessageFlags.Ephemeral,
      });
    }

    const minutes = interaction.options.getInteger('minutes') || 0;
    const seconds = interaction.options.getInteger('seconds') || 0;
    const totalSeconds = minutes * 60 + seconds;

    await interaction.reply({
      content: `タイマーを${minutes}分${seconds}秒にセットしました\nタイマーが終了すると通知します`,
    });

    setTimer(interaction, totalSeconds);
  },
};
