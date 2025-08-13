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

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('指定したメッセージを削除します')
    .addIntegerOption((option) =>
      option
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
    const requiredPermissions = [
      PermissionFlagsBits.ManageMessages,
      PermissionFlagsBits.ReadMessageHistory,
      PermissionFlagsBits.ViewChannel,
    ];

    if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

    const count = interaction.options.getInteger('count');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const messages = await interaction.channel.bulkDelete(count, true);

    if (messages.size === 0) {
      return interaction.editReply({
        embeds: [
          createEmbed(interaction, {
            title: '削除できるメッセージがありません',
            description:
              '削除対象が存在しないか、14日以上前のメッセージのため削除できませんでした',
            color: Colors.Yellow,
          }),
        ],
      });
    }

    const description =
      messages.size < count
        ? `${messages.size} 件のメッセージを削除しました（指定: ${count} 件）\n※一部のメッセージは14日以上経過しているため削除できませんでした`
        : `${messages.size} 件のメッセージを削除しました`;

    const embed = createEmbed(interaction, {
      title: 'メッセージ削除完了',
      description,
      color: Colors.Green,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
