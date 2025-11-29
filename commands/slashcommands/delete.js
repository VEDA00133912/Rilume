const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionFlagsBits,
  MessageFlags,
  Colors,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { checkBotPermissions } = require('../../utils/checkPermissions');

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.ReadMessageHistory,
  PermissionFlagsBits.ViewChannel,
];

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('指定したメッセージを削除します')
    .addIntegerOption((opt) =>
      opt
        .setName('count')
        .setDescription('削除したいメッセージの数を入力')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const count = interaction.options.getInteger('count');
    const messages = await interaction.channel.bulkDelete(count, true);

    const embed = createEmbed(interaction, {
      title: messages.size === 0 ? '削除できるメッセージがありません' : 'メッセージ削除完了',
      description:
        messages.size === 0
          ? '削除対象が存在しないか、14日以上前のメッセージのため削除できませんでした'
          : messages.size < count
            ? `${messages.size} 件のメッセージを削除しました（指定: ${count} 件）\n※一部のメッセージは14日以上経過しているため削除できませんでした`
            : `${messages.size} 件のメッセージを削除しました`,
      color: messages.size === 0 ? Colors.Yellow : Colors.Green,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
