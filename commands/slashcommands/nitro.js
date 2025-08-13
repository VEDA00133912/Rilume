const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { generatNitroCode } = require('../../lib/generate/nitro');
const wait = require('../../utils/wait')

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('nitro')
    .setDescription('偽Nitroリンクを生成します')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('生成するコードのタイプ')
        .setRequired(true)
        .addChoices(
          { name: 'Gift Nitro', value: 'gift' },
          { name: 'Promotion Nitro', value: 'promo' },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setDescription('生成するコードの数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const count = interaction.options.getInteger('count');

    const prepareEmbed = createEmbed(interaction, {
      title: 'Nitroリンク生成中',
      description: `タイプ: ${type}\n生成数: ${count}`,
      color: '#de98f1',
    });

    await interaction.reply({
      embeds: [prepareEmbed],
      flags: MessageFlags.Ephemeral,
    });
    await wait(1000) // 1秒待機
    const nitroLinks = generatNitroCode(type, count);

    const embed = createEmbed(interaction, {
      description: `**生成が完了しました**\n${nitroLinks.join('\n')}`,
      color: '#de98f1',
      footer: 'このコードは実際に使えるものではありません',
    });

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
