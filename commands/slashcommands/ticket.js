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

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
];

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('チケットを作成します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    await interaction.reply({
      embeds: [
        createEmbed(interaction, {
          description: 'チケットチャンネルを作成するときは下のボタンを押してください',
        }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('create').setStyle(ButtonStyle.Primary).setLabel('作成'),
        ),
      ],
    });
  },
};
