const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { checkBotPermissions } = require('../../utils/checkPermissions');

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('チケットを作成します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const requiredPermissions = [
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    const create = new ButtonBuilder()
      .setCustomId('create')
      .setStyle(ButtonStyle.Primary)
      .setLabel('作成');

    const embed = createEmbed(interaction, {
      description:
        'チケットチャンネルを作成するときは下のボタンを押してください',
    });

    const button = new ActionRowBuilder().addComponents(create);

    await interaction.reply({
      embeds: [embed],
      components: [button],
    });
  },
};
