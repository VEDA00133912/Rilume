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

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
];

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('timer')
    .setDescription('タイマーをセットします')
    .addIntegerOption((opt) =>
      opt.setName('minutes').setDescription('タイマーの分数').setMinValue(1).setMaxValue(60),
    )
    .addIntegerOption((opt) =>
      opt.setName('seconds').setDescription('タイマーの秒数').setMinValue(1).setMaxValue(60),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    if (await hasTimer(interaction.user.id)) {
      return interaction.reply({
        content: 'すでにタイマーがセットされています',
        flags: MessageFlags.Ephemeral,
      });
    }

    const minutes = interaction.options.getInteger('minutes') ?? 0;
    const seconds = interaction.options.getInteger('seconds') ?? 0;
    const totalSeconds = minutes * 60 + seconds;

    await interaction.reply({
      content: `タイマーを${minutes}分${seconds}秒にセットしました\nタイマーが終了すると通知します`,
    });

    setTimer(interaction, totalSeconds);
  },
};
